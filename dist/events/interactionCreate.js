"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const LOA_1 = __importDefault(require("../models/LOA"));
const GuildConfig_1 = __importDefault(require("../models/GuildConfig"));
const logger_1 = __importDefault(require("../utils/logger"));
const log = new logger_1.default();
exports.default = {
    name: discord_js_1.Events.InteractionCreate,
    async execute(interaction, client) {
        try {
            if (interaction.isChatInputCommand())
                await handleCmd(interaction, client);
            else if (interaction.isButton())
                await handleBtn(interaction);
            else if (interaction.isModalSubmit())
                await handleModal(interaction);
            else if (interaction.isAutocomplete())
                await handleAutocomplete(interaction, client);
        }
        catch (e) {
            log.error('Interaction error', e);
            sendErr(interaction);
        }
    }
};
async function handleCmd(interaction, client) {
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd)
        return;
    if (!checkCooldown(interaction, cmd, client))
        return;
    await cmd.execute(interaction, client);
}
function checkCooldown(interaction, cmd, client) {
    const name = cmd.data.name;
    if (!client.cooldowns.has(name))
        client.cooldowns.set(name, new discord_js_1.Collection());
    const now = Date.now();
    const timestamps = client.cooldowns.get(name);
    const amt = (cmd.cooldown ?? 3) * 1000;
    if (timestamps.has(interaction.user.id)) {
        const exp = timestamps.get(interaction.user.id) + amt;
        if (now < exp) {
            interaction.reply({ content: '⏰ Please wait ' + ((exp - now) / 1000).toFixed(1) + 's.', ephemeral: true });
            return false;
        }
    }
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), amt);
    return true;
}
async function handleBtn(interaction) {
    if (!interaction.customId.startsWith('loa_'))
        return;
    const parts = interaction.customId.split('_');
    if (parts.length < 3)
        return;
    const action = parts[1], loaId = parts[2];
    const loa = await LOA_1.default.findOne({ loaId });
    if (!loa)
        return interaction.reply({ content: '❌ LOA not found.', ephemeral: true });
    const cfg = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
    if (!cfg)
        return interaction.reply({ content: '❌ Not configured.', ephemeral: true });
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const perm = member.roles.cache.has(cfg.staffRole ?? '') || cfg.adminRoles.some(r => member.roles.cache.has(r)) || member.permissions.has('Administrator');
    if (action === 'approve') {
        if (!perm)
            return interaction.reply({ content: '❌ No permission.', ephemeral: true });
        loa.status = 'approved';
        loa.approvedBy = interaction.user.id;
        loa.approvedAt = new Date();
        await loa.save();
        if (cfg.loaRole) {
            const m = await interaction.guild.members.fetch(loa.userId).catch(() => null);
            if (m)
                await m.roles.add(cfg.loaRole).catch(() => { });
        }
        await interaction.update({ content: '✅ Approved', components: [], embeds: [loaEmbed(loa)] });
    }
    else if (action === 'deny') {
        if (!perm)
            return interaction.reply({ content: '❌ No permission.', ephemeral: true });
        loa.status = 'denied';
        loa.deniedBy = interaction.user.id;
        loa.deniedAt = new Date();
        await loa.save();
        await interaction.update({ content: '❌ Denied', components: [], embeds: [loaEmbed(loa)] });
    }
    else if (action === 'cancel') {
        if (loa.userId !== interaction.user.id && !perm)
            return interaction.reply({ content: '❌ Cannot cancel.', ephemeral: true });
        loa.status = 'cancelled';
        loa.cancelledBy = interaction.user.id;
        loa.cancelledAt = new Date();
        await loa.save();
        if (cfg.loaRole) {
            const m = await interaction.guild.members.fetch(loa.userId).catch(() => null);
            if (m)
                await m.roles.remove(cfg.loaRole).catch(() => { });
        }
        await interaction.update({ content: '🚫 Cancelled', components: [], embeds: [loaEmbed(loa)] });
    }
}
async function handleModal(interaction) {
    if (interaction.customId.startsWith('loa_reason_')) {
        const parts = interaction.customId.replace('loa_reason_', '').split('_');
        if (parts.length < 4)
            return interaction.reply({ content: '❌ Invalid data.', ephemeral: true });
        const type = parts[0], start = new Date(parts[1]), end = new Date(parts[2]), dept = parts.slice(3).join('_');
        const reason = interaction.fields.getTextInputValue('reason');
        await submitLOA(interaction, type, start, end, dept, reason);
    }
    else if (interaction.customId === 'loa_custom_duration') {
        const start = new Date(interaction.fields.getTextInputValue('start_date'));
        const end = new Date(interaction.fields.getTextInputValue('end_date'));
        if (isNaN(start.getTime()) || isNaN(end.getTime()))
            return interaction.reply({ content: '❌ Invalid date format.', ephemeral: true });
        const reason = interaction.fields.getTextInputValue('reason');
        await submitLOA(interaction, 'Custom', start, end, 'General', reason);
    }
}
async function submitLOA(interaction, type, start, end, dept, reason) {
    const cfg = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
    if (!cfg)
        return interaction.reply({ content: '❌ Not configured.', ephemeral: true });
    if (end <= start)
        return interaction.reply({ content: '❌ End date must be after start.', ephemeral: true });
    const days = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    if (days > cfg.maxLoaDuration)
        return interaction.reply({ content: '❌ Maximum ' + cfg.maxLoaDuration + ' days.', ephemeral: true });
    if (cfg.whitelistRoles.length > 0) {
        const mem = await interaction.guild.members.fetch(interaction.user.id);
        if (!mem.roles.cache.some(r => cfg.whitelistRoles.includes(r.id)))
            return interaction.reply({ content: '❌ You are not whitelisted.', ephemeral: true });
    }
    const recent = await LOA_1.default.findOne({
        userId: interaction.user.id, guildId: interaction.guildId,
        createdAt: { $gte: new Date(Date.now() - cfg.cooldownHours * 3600000) }
    }).sort({ createdAt: -1 });
    if (recent) {
        const left = Math.ceil((recent.createdAt.getTime() + cfg.cooldownHours * 3600000 - Date.now()) / 3600000);
        return interaction.reply({ content: '⏰ Cooldown. Wait ' + left + 'h.', ephemeral: true });
    }
    const loaId = LOA_1.default.generateLOAId();
    const loa = new LOA_1.default({ loaId, guildId: interaction.guildId, userId: interaction.user.id, type, reason, startDate: start, endDate: end, department: dept, status: 'pending' });
    await loa.save();
    const embed = new discord_js_1.EmbedBuilder().setColor(0xCFB87C).setTitle('📝 LOA Submitted')
        .addFields([
        { name: 'ID', value: '#' + loaId, inline: true },
        { name: 'Type', value: type, inline: true },
        { name: 'Duration', value: days + ' days', inline: true },
        { name: 'Reason', value: reason }
    ])
        .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
    if (cfg.logChannel) {
        const ch = interaction.guild.channels.cache.get(cfg.logChannel);
        if (ch?.isTextBased()) {
            const logEmbed = new discord_js_1.EmbedBuilder().setColor(0xCFB87C).setTitle('⏳ New LOA Request')
                .addFields([
                { name: 'ID', value: '#' + loaId },
                { name: 'User', value: '<@' + interaction.user.id + '>' },
                { name: 'Type', value: type },
                { name: 'Reason', value: reason }
            ])
                .setTimestamp();
            const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('loa_approve_' + loaId).setLabel('Approve').setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder().setCustomId('loa_deny_' + loaId).setLabel('Deny').setStyle(discord_js_1.ButtonStyle.Danger));
            await ch.send({ embeds: [logEmbed], components: [row] }).catch(() => { });
        }
    }
}
async function handleAutocomplete(interaction, client) {
    const cmd = client.commands.get(interaction.commandName);
    if (cmd?.autocomplete)
        await cmd.autocomplete(interaction).catch(() => interaction.respond([]));
}
async function sendErr(interaction) {
    try {
        const payload = { content: '❌ An unexpected error occurred.', ephemeral: true };
        if (interaction.replied || interaction.deferred)
            await interaction.followUp(payload);
        else
            await interaction.reply(payload);
    }
    catch { }
}
function loaEmbed(loa) {
    const colors = {
        pending: 0xCFB87C, approved: 0x57F287, denied: 0xED4245, cancelled: 0x95A5A6, expired: 0x95A5A6
    };
    const emojis = {
        pending: '⏳', approved: '✅', denied: '❌', cancelled: '🚫', expired: '⏰'
    };
    return {
        color: colors[loa.status] || 0xCFB87C,
        title: emojis[loa.status] + ' LOA #' + loa.loaId,
        fields: [
            { name: 'User', value: '<@' + loa.userId + '>', inline: true },
            { name: 'Type', value: loa.type, inline: true },
            { name: 'Status', value: loa.status.charAt(0).toUpperCase() + loa.status.slice(1), inline: true },
            { name: 'Start', value: '<t:' + Math.floor(loa.startDate.getTime() / 1000) + ':D>', inline: true },
            { name: 'End', value: '<t:' + Math.floor(loa.endDate.getTime() / 1000) + ':D>', inline: true },
            { name: 'Reason', value: loa.reason }
        ],
        timestamp: new Date().toISOString()
    };
}
//# sourceMappingURL=interactionCreate.js.map