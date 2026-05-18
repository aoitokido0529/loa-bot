import { Events, ActivityType } from 'discord.js';
import Logger from '../utils/logger';
import LOA from '../models/LOA';
import GuildConfig from '../models/GuildConfig';
const logger = new Logger();
export default {
  name: Events.ClientReady,
  once: true,
  execute(client:any) {
    logger.success('Ready! Logged in as '+client.user.tag);
    client.user.setPresence({ activities:[{ name:'/setup | /loarequest', type:ActivityType.Listening }], status:'online' });
    startReminderSystem(client);
    startAutoExpireSystem(client);
  }
};
function startReminderSystem(client:any) {
  setInterval(async () => {
    try {
      const now = new Date();
      const expiring = await LOA.find({ status:'approved', endDate:{ $gte:now, $lte:new Date(now.getTime()+86400000) }, reminderSent:false });
      for(const loa of expiring) {
        const guild = client.guilds.cache.get(loa.guildId);
        if(!guild) continue;
        const member = await guild.members.fetch(loa.userId).catch(()=>null);
        if(!member) continue;
        const hours = Math.round((loa.endDate.getTime()-now.getTime())/3600000);
        await member.send({ embeds:[{ color:0xFEE75C, title:'⏰ LOA Expiring', description:'Your '+loa.type+' will expire in ~'+hours+' hours.', fields:[{name:'LOA ID',value:loa.loaId}] }] }).catch(()=>{});
        loa.reminderSent = true;
        await loa.save();
      }
    } catch(e) {}
  }, 3600000);
}
function startAutoExpireSystem(client:any) {
  setInterval(async () => {
    try {
      const expired = await LOA.find({ status:'approved', endDate:{ $lte:new Date() } });
      for(const loa of expired) {
        const config = await GuildConfig.findOne({ guildId:loa.guildId });
        if(config && config.autoExpire) {
          loa.status = 'expired';
          await loa.save();
          if(config.loaRole) {
            const guild = client.guilds.cache.get(loa.guildId);
            if(guild) {
              const member = await guild.members.fetch(loa.userId).catch(()=>null);
              if(member) await member.roles.remove(config.loaRole).catch(()=>{});
            }
          }
        }
      }
    } catch(e) {}
  }, 3600000);
}