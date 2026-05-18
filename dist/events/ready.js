"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const logger_1 = __importDefault(require("../utils/logger"));
const LOA_1 = __importDefault(require("../models/LOA"));
const GuildConfig_1 = __importDefault(require("../models/GuildConfig"));
const logger = new logger_1.default();
exports.default = {
    name: discord_js_1.Events.ClientReady,
    once: true,
    execute(client) {
        logger.success('Ready! Logged in as ' + client.user.tag);
        client.user.setPresence({ activities: [{ name: '/setup | /loarequest', type: discord_js_1.ActivityType.Listening }], status: 'online' });
        startReminderSystem(client);
        startAutoExpireSystem(client);
    }
};
function startReminderSystem(client) {
    setInterval(async () => {
        try {
            const now = new Date();
            const expiring = await LOA_1.default.find({ status: 'approved', endDate: { $gte: now, $lte: new Date(now.getTime() + 86400000) }, reminderSent: false });
            for (const loa of expiring) {
                const guild = client.guilds.cache.get(loa.guildId);
                if (!guild)
                    continue;
                const member = await guild.members.fetch(loa.userId).catch(() => null);
                if (!member)
                    continue;
                const hours = Math.round((loa.endDate.getTime() - now.getTime()) / 3600000);
                await member.send({ embeds: [{ color: 0xFEE75C, title: '⏰ LOA Expiring', description: 'Your ' + loa.type + ' will expire in ~' + hours + ' hours.', fields: [{ name: 'LOA ID', value: loa.loaId }] }] }).catch(() => { });
                loa.reminderSent = true;
                await loa.save();
            }
        }
        catch (e) { }
    }, 3600000);
}
function startAutoExpireSystem(client) {
    setInterval(async () => {
        try {
            const expired = await LOA_1.default.find({ status: 'approved', endDate: { $lte: new Date() } });
            for (const loa of expired) {
                const config = await GuildConfig_1.default.findOne({ guildId: loa.guildId });
                if (config && config.autoExpire) {
                    loa.status = 'expired';
                    await loa.save();
                    if (config.loaRole) {
                        const guild = client.guilds.cache.get(loa.guildId);
                        if (guild) {
                            const member = await guild.members.fetch(loa.userId).catch(() => null);
                            if (member)
                                await member.roles.remove(config.loaRole).catch(() => { });
                        }
                    }
                }
            }
        }
        catch (e) { }
    }, 3600000);
}
//# sourceMappingURL=ready.js.map