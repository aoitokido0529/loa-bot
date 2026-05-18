"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const LOA_1 = __importDefault(require("../models/LOA"));
const GuildConfig_1 = __importDefault(require("../models/GuildConfig"));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('loacd').setDescription('⏰ Cooldown management')
        .addSubcommand(s => s.setName('check').setDescription('Check cooldown').addUserOption(o => o.setName('user').setDescription('User')))
        .addSubcommand(s => s.setName('clear').setDescription('Clear cooldown (Admin)').addUserOption(o => o.setName('user').setDescription('User to clear').setRequired(true))),
    async execute(interaction) {
        const cfg = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
        if (!cfg)
            return interaction.reply({ content: 'Use /setup first.', ephemeral: true });
        const sub = interaction.options.getSubcommand();
        const mem = await interaction.guild.members.fetch(interaction.user.id);
        if (sub === 'check') {
            const t = interaction.options.getUser('user') || interaction.user;
            if (t.id !== interaction.user.id) {
                const isStaff = mem.roles.cache.has(cfg.staffRole ?? '') || cfg.adminRoles.some(r => mem.roles.cache.has(r)) || mem.permissions.has('Administrator');
                if (!isStaff)
                    return interaction.reply({ content: '❌ Own cooldown only.', ephemeral: true });
            }
            const recent = await LOA_1.default.findOne({ userId: t.id, guildId: interaction.guildId, createdAt: { $gte: new Date(Date.now() - cfg.cooldownHours * 3600000) } }).sort({ createdAt: -1 });
            const embed = new discord_js_1.EmbedBuilder().setTitle('Cooldown').addFields([{ name: 'User', value: '<@' + t.id + '>', inline: true }, { name: 'Cooldown', value: cfg.cooldownHours + 'h', inline: true }]);
            if (recent) {
                const end = new Date(recent.createdAt.getTime() + cfg.cooldownHours * 3600000);
                const left = end.getTime() - Date.now();
                embed.setColor(left > 0 ? 0xFEE75C : 0x57F287).addFields([{ name: 'Status', value: left > 0 ? '⏳ On Cooldown' : '✅ Available', inline: true }, { name: 'Last', value: '#' + recent.loaId + ' (' + recent.status + ')', inline: true }]);
                if (left > 0)
                    embed.addFields([{ name: 'Ready', value: '<t:' + Math.floor(end.getTime() / 1000) + ':R>', inline: true }]);
            }
            else
                embed.setColor(0x57F287).addFields([{ name: 'Status', value: '✅ Available', inline: true }]);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        const isAdmin = cfg.adminRoles.some(r => mem.roles.cache.has(r)) || mem.permissions.has('Administrator');
        if (!isAdmin)
            return interaction.reply({ content: '❌ Admin only.', ephemeral: true });
        const target = interaction.options.getUser('user', true);
        const nonApproved = await LOA_1.default.findOne({ userId: target.id, guildId: interaction.guildId, status: { $ne: 'approved' }, createdAt: { $gte: new Date(Date.now() - cfg.cooldownHours * 3600000) } }).sort({ createdAt: -1 });
        if (!nonApproved) {
            const approved = await LOA_1.default.findOne({ userId: target.id, guildId: interaction.guildId, status: 'approved', createdAt: { $gte: new Date(Date.now() - cfg.cooldownHours * 3600000) } });
            if (approved)
                return interaction.reply({ content: '⚠️ Active LOA #' + approved.loaId + '. Cancel it first.', ephemeral: true });
            return interaction.reply({ content: '✅ Not on cooldown.', ephemeral: true });
        }
        await LOA_1.default.deleteOne({ _id: nonApproved._id });
        return interaction.reply({ embeds: [new discord_js_1.EmbedBuilder().setColor(0x57F287).setTitle('✅ Cooldown Cleared').setDescription('Removed #' + nonApproved.loaId + ' (' + nonApproved.status + ') for <@' + target.id + '>.')] });
    }
};
//# sourceMappingURL=loacd.js.map