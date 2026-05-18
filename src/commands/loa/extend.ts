import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import LOA from '../../models/LOA';
import GuildConfig from '../../models/GuildConfig';
export default {
  data: new SlashCommandBuilder().setName('loa').setDescription('Extend').addSubcommand(s=>s.setName('extend').setDescription('Extend').addStringOption(o=>o.setName('id').setDescription('LOA ID').setRequired(true).setAutocomplete(true)).addStringOption(o=>o.setName('duration').setDescription('Extension').setRequired(true).addChoices({name:'1 Day',value:'1d'},{name:'3 Days',value:'3d'},{name:'7 Days',value:'7d'},{name:'14 Days',value:'14d'},{name:'30 Days',value:'30d'}))),
  async autocomplete(interaction:any) {
    const config = await GuildConfig.findOne({guildId:interaction.guildId});
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const isStaff = member.roles.cache.has(config?.staffRole??'') || config?.adminRoles.some(roleId => member.roles.cache.has(roleId)) || member.permissions.has('Administrator');
    const q:any = {guildId:interaction.guildId, status:'approved', loaId:{$regex:interaction.options.getFocused(),$options:'i'}};
    if(!isStaff) q.userId = interaction.user.id;
    const loas = await LOA.find(q).limit(25);
    await interaction.respond(loas.map((l:any)=>({name:'#'+l.loaId,value:l.loaId})));
  },
  async execute(interaction:any) {
    const loa = await LOA.findOne({loaId:interaction.options.getString('id'), guildId:interaction.guildId});
    if(!loa) return interaction.reply({content:'Not found.', ephemeral:true});
    if(loa.status!=='approved') return interaction.reply({content:'Only approved LOAs.', ephemeral:true});
    const config = await GuildConfig.findOne({guildId:interaction.guildId});
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const isStaff = member.roles.cache.has(config?.staffRole??'') || config?.adminRoles.some(roleId => member.roles.cache.has(roleId)) || member.permissions.has('Administrator');
    if(loa.userId!==interaction.user.id && !isStaff) return interaction.reply({content:'Cannot extend.', ephemeral:true});
    const days = parseInt(interaction.options.getString('duration'));
    const newEnd = new Date(loa.endDate); newEnd.setDate(newEnd.getDate()+days);
    const total = Math.ceil((newEnd.getTime()-loa.startDate.getTime())/86400000);
    if(config && total>config.maxLoaDuration) return interaction.reply({content:'Max '+config.maxLoaDuration+' days.', ephemeral:true});
    loa.endDate = newEnd; loa.reminderSent = false;
    await loa.save();
    await interaction.reply({embeds:[new EmbedBuilder().setColor(0x57F287).setTitle('Extended').setDescription('Extended by '+days+' days')]});
  }
};