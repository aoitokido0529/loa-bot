import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import LOA from '../../models/LOA';
import GuildConfig from '../../models/GuildConfig';
import Pagination from '../../utils/pagination';
export default {
  data: new SlashCommandBuilder().setName('loa').setDescription('History').addSubcommand(s=>s.setName('history').setDescription('View history').addUserOption(o=>o.setName('user').setDescription('User')).addStringOption(o=>o.setName('filter').setDescription('Filter').addChoices({name:'All',value:'all'},{name:'Approved',value:'approved'},{name:'Denied',value:'denied'}))),
  async execute(interaction:any) {
    const config = await GuildConfig.findOne({guildId:interaction.guildId});
    if(!config) return interaction.reply({content:'Not configured.', ephemeral:true});
    const target = interaction.options.getUser('user')||interaction.user;
    if(target.id!==interaction.user.id) {
      const m = await interaction.guild.members.fetch(interaction.user.id);
      if(!m.roles.cache.has(config.staffRole??'') && !config.adminRoles.some(roleId => m.roles.cache.has(roleId)) && !m.permissions.has('Administrator')) return interaction.reply({content:'Own history only.', ephemeral:true});
    }
    const filter = interaction.options.getString('filter')||'all';
    const q:any = {guildId:interaction.guildId, userId:target.id};
    if(filter!=='all') q.status = filter;
    const loas = await LOA.find(q).sort({createdAt:-1}).limit(50);
    if(!loas.length) return interaction.reply({embeds:[{color:0x5865F2,title:'No History'}], ephemeral:true});
    const pages = [];
    for(let i=0;i<loas.length;i+=5) {
      const embed = new EmbedBuilder().setColor(0x5865F2).setTitle('History - '+target.tag);
      for(const l of loas.slice(i,i+5)) embed.addFields({name:'#'+l.loaId, value:l.type+' - '+l.status.toUpperCase()});
      pages.push({embeds:[embed]});
    }
    new Pagination(pages).start(interaction);
  }
};