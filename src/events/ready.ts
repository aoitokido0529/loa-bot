import { Events, ActivityType } from 'discord.js';
import Logger from '../utils/logger';
import LOA from '../models/LOA';
import GuildConfig from '../models/GuildConfig';

const log = new Logger();

export default {
    name: Events.ClientReady,
    once: true,
    execute(client: any) {
        log.success('Connected as ' + client.user.tag);
        client.user.setPresence({
            activities: [{ name: 'over your leaves', type: ActivityType.Watching }],
            status: 'online'
        });
        startReminders(client);
        startAutoExpire(client);
    }
};

function startReminders(client: any) {
    setInterval(async () => {
        try {
            const now = new Date();
            const items = await LOA.find({
                status: 'approved',
                endDate: { $gte: now, $lte: new Date(now.getTime() + 86400000) },
                reminderSent: false
            });
            for (const loa of items) {
                const guild = client.guilds.cache.get(loa.guildId);
                if (!guild) continue;
                const member = await guild.members.fetch(loa.userId).catch(() => null);
                if (!member) continue;
                const hours = Math.round((loa.endDate.getTime() - now.getTime()) / 3600000);
                await member.send({
                    embeds: [{
                        color: 0xCFB87C,
                        title: '⏰ LOA Expiration Reminder',
                        description: 'Your ' + loa.type + ' will expire in approximately **' + hours + ' hour(s)**.',
                        fields: [{ name: 'LOA ID', value: loa.loaId }]
                    }]
                }).catch(() => {});
                loa.reminderSent = true;
                await loa.save();
            }
        } catch (e) {}
    }, 3600000);
}

function startAutoExpire(client: any) {
    setInterval(async () => {
        try {
            const now = new Date();
            const items = await LOA.find({ status: 'approved', endDate: { $lte: now } });
            for (const loa of items) {
                const cfg = await GuildConfig.findOne({ guildId: loa.guildId });
                if (cfg?.autoExpire) {
                    loa.status = 'expired';
                    await loa.save();
                    if (cfg.loaRole) {
                        const guild = client.guilds.cache.get(loa.guildId);
                        if (guild) {
                            const member = await guild.members.fetch(loa.userId).catch(() => null);
                            if (member) await member.roles.remove(cfg.loaRole).catch(() => {});
                        }
                    }
                }
            }
        } catch (e) {}
    }, 3600000);
}