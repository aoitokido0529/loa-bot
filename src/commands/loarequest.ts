import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import GuildConfig from '../models/GuildConfig';
import LOA from '../models/LOA';
export default {
  data: new SlashCommandBuilder()
    .setName('loarequest').setDescription('Submit a new LOA')
    .addStringOption(o=>o.setName('type').setDescription('Type of LOA').setRequired(true).setAutocomplete(true))
    .addStringOption(o=>o.setName('duration').setDescription('Duration').setRequired(true).addChoices(
      {name:'1 Day',value:'1d'},{name:'3 Days',value:'3d'},{name:'7 Days',value:'7d'},{name:'14 Days',value:'14d'},{name:'30 Days',value:'30d'},{name:'Custom',value:'custom'}
    ))
    .addStringOption(o=>o.setName('department').setDescription('Department').setRequired(false).setAutocomplete(true)),
  cooldown: 10,
  async autocomplete(interaction:any) {
    const f = interaction.options.getFocused(true);
    const config = await GuildConfig.findOne({guildId:interaction.guildId});
    let choices:string[] = [];
    if(f.name==='type') choices = config?.loaTypes||['Full LOA'];
    else if(f.name==='department') choices = config?.departments||['General'];
    const filtered = choices.filter((c:string)=>c.toLowerCase().includes(f.value.toLowerCase()));
    await interaction.respond(filtered.map((c:string)=>({name:c,value:c})));
  },
  async execute(interaction:any) {
    const config = await GuildConfig.findOne({guildId:interaction.guildId});
    if(!config) return interaction.reply({content:'Use /setup first.', ephemeral:true});

    // Whitelist check
    if(config.whitelistRoles.length>0) {
      const member = await interaction.guild.members.fetch(interaction.user.id);
      const hasRole = member.roles.cache.some((r:any)=>config.whitelistRoles.includes(r.id));
      if(!hasRole) return interaction.reply({content:'❌ You are not whitelisted to submit LOA requests.', ephemeral:true});
    }

    const recent = await LOA.findOne({userId:interaction.user.id, guildId:interaction.guildId, createdAt:{$gte:new Date(Date.now()-config.cooldownHours*3600000)}}).sort({createdAt:-1});
    if(recent) {
      const left = Math.ceil((recent.createdAt.getTime()+config.cooldownHours*3600000-Date.now())/3600000);
      return interaction.reply({content:'⏰ Wait '+left+'h.', ephemeral:true});
    }
    const type = interaction.options.getString('type');
    const dur = interaction.options.getString('duration');
    const dept = interaction.options.getString('department')||'General';
    if(dur==='custom') {
      const modal = new ModalBuilder().setCustomId('loa_custom_duration').setTitle('Custom LOA');
      modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('start_date').setLabel('Start (YYYY-MM-DD)').setStyle(TextInputStyle.Short).setPlaceholder('2024-01-01').setRequired(true)),
        new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('end_date').setLabel('End (YYYY-MM-DD)').setStyle(TextInputStyle.Short).setPlaceholder('2024-01-07').setRequired(true)),
        new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('reason').setLabel('Reason').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000))
      );
      return interaction.showModal(modal);
    }
    const days = parseInt(dur);
    const start = new Date(); const end = new Date(); end.setDate(end.getDate()+days);
    const modal = new ModalBuilder().setCustomId('loa_reason_'+type+'_'+start.toISOString()+'_'+end.toISOString()+'_'+dept).setTitle('LOA Reason');
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('reason').setLabel('Reason').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000)));
    await interaction.showModal(modal);
  }
};