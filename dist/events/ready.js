"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const logger_1 = __importDefault(require("../utils/logger"));
const LOA_1 = __importDefault(require("../models/LOA"));
const GuildConfig_1 = __importDefault(require("../models/GuildConfig"));
const log = new logger_1.default();
exports.default = {
    name: discord_js_1.Events.ClientReady,
    once: true,
    execute(client) {
        log.success('Connected as ' + client.user.tag);
        client.user.setPresence({
            activities: [{ name: 'over your leaves', type: discord_js_1.ActivityType.Watching }],
            status: 'online'
        });
        startReminders(client);
        startAutoExpire(client);
    }
};
function startReminders(client) {
    setInterval(async () => {
        try {
            const now = new Date();
            const items = await LOA_1.default.find({
                status: 'approved',
                endDate: { $gte: now, $lte: new Date(now.getTime() + 86400000) },
                reminderSent: false
            });
            for (const loa of items) {
                const guild = client.guilds.cache.get(loa.guildId);
                if (!guild)
                    continue;
                const member = await guild.members.fetch(loa.userId).catch(() => null);
                if (!member)
                    continue;
                const hours = Math.round((loa.endDate.getTime() - now.getTime()) / 3600000);
                await member.send({
                    embeds: [{
                            color: 0xCFB87C,
                            title: '⏰ LOA Expiration Reminder',
                            description: 'Your ' + loa.type + ' will expire in approximately **' + hours + ' hour(s)**.',
                            fields: [{ name: 'LOA ID', value: loa.loaId }]
                        }]
                }).catch(() => { });
                loa.reminderSent = true;
                await loa.save();
            }
        }
        catch (e) { }
    }, 3600000);
}
function startAutoExpire(client) {
    setInterval(async () => {
        try {
            const now = new Date();
            const items = await LOA_1.default.find({ status: 'approved', endDate: { $lte: now } });
            for (const loa of items) {
                const cfg = await GuildConfig_1.default.findOne({ guildId: loa.guildId });
                if (cfg?.autoExpire) {
                    loa.status = 'expired';
                    await loa.save();
                    if (cfg.loaRole) {
                        const guild = client.guilds.cache.get(loa.guildId);
                        if (guild) {
                            const member = await guild.members.fetch(loa.userId).catch(() => null);
                            if (member)
                                await member.roles.remove(cfg.loaRole).catch(() => { });
                        }
                    }
                }
            }
        }
        catch (e) { }
    }, 3600000);
}
//# sourceMappingURL=ready.js.map