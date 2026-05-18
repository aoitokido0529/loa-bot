import {
    Events,
    Collection,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ChatInputCommandInteraction,
    ButtonInteraction,
    ModalSubmitInteraction,
    AutocompleteInteraction
} from 'discord.js';
import LOA from '../models/LOA';
import GuildConfig from '../models/GuildConfig';
import Logger from '../utils/logger';

const logger = new Logger();

export default {
    name: Events.InteractionCreate,
    async execute(interaction: any, client: any) {
        try {
            if (interaction.isChatInputCommand()) await handleCommand(interaction, client);
            else if (interaction.isButton()) await handleButton(interaction);
            else if (interaction.isModalSubmit()) await handleModal(interaction);
            else if (interaction.isAutocomplete()) await handleAutocomplete(interaction, client);
        } catch (e) {
            logger.error('Interaction error:', e);
            await sendError(interaction);
        }
    }
};

async function handleCommand(interaction: ChatInputCommandInteraction, client: any) {
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;
    if (!checkCooldown(interaction, cmd, client)) return;
    await cmd.execute(interaction, client);
}

function checkCooldown(interaction: ChatInputCommandInteraction, cmd: any, client: any): boolean {
    const name = cmd.data.name;
    if (!client.cooldowns.has(name)) client.cooldowns.set(name, new Collection());
    const now = Date.now();
    const timestamps = client.cooldowns.get(name) as Collection<string, number>;
    const amount = (cmd.cooldown ?? 3) * 1000;
    if (timestamps.has(interaction.user.id)) {
        const exp = timestamps.get(interaction.user.id)! + amount;
        if (now < exp) {
            interaction.reply({ content: '⏰ Please wait ' + (exp - now) / 1000 + 's.', ephemeral: true });
            return false;
        }
    }
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), amount);
    return true;
}

async function handleButton(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith('loa_')) return;
    const parts = interaction.customId.split('_');
    if (parts.length < 3) return;
    const action = parts[1],
        loaId = parts[2];
    const loa = await LOA.findOne({ loaId });
    if (!loa) return interaction.reply({ content: '❌ LOA not found.', ephemeral: true });
    const config = await GuildConfig.findOne({ guildId: interaction.guildId });
    if (!config) return interaction.reply({ content: '❌ Not configured.', ephemeral: true });
    const member = await interaction.guild!.members.fetch(interaction.user.id);
    const perm = member.roles.cache.has(config.staffRole ?? '') ||
        config.adminRoles.some(roleId => member.roles.cache.has(roleId)) ||
        member.permissions.has('Administrator');

    if (action === 'approve') {
        if (!perm) return interaction.reply({ content: '❌ No permission.', ephemeral: true });
        loa.status = 'approved';
        loa.approvedBy = interaction.user.id;
        loa.approvedAt = new Date();
        await loa.save();
        if (config.loaRole) {
            const m = await interaction.guild!.members.fetch(loa.userId).catch(() => null);
            if (m) await m.roles.add(config.loaRole).catch(() => {});
        }
        await interaction.update({ content: '✅ Approved!', components: [], embeds: [createLOAEmbed(loa)] });
    } else if (action === 'deny') {
        if (!perm) return interaction.reply({ content: '❌ No permission.', ephemeral: true });
        loa.status = 'denied';
        loa.deniedBy = interaction.user.id;
        loa.deniedAt = new Date();
        await loa.save();
        await interaction.update({ content: '❌ Denied.', components: [], embeds: [createLOAEmbed(loa)] });
    } else if (action === 'cancel') {
        if (loa.userId !== interaction.user.id && !perm)
            return interaction.reply({ content: '❌ Cannot cancel.', ephemeral: true });
        loa.status = 'cancelled';
        loa.cancelledBy = interaction.user.id;
        loa.cancelledAt = new Date();
        await loa.save();
        if (config.loaRole) {
            const m = await interaction.guild!.members.fetch(loa.userId).catch(() => null);
            if (m) await m.roles.remove(config.loaRole).catch(() => {});
        }
        await interaction.update({ content: '🚫 Cancelled.', components: [], embeds: [createLOAEmbed(loa)] });
    }
}

async function handleModal(interaction: ModalSubmitInteraction) {
    if (interaction.customId.startsWith('loa_reason_')) {
        const parts = interaction.customId.replace('loa_reason_', '').split('_');
        if (parts.length < 4) return interaction.reply({ content: '❌ Invalid data.', ephemeral: true });
        const type = parts[0],
            start = new Date(parts[1]),
            end = new Date(parts[2]),
            dept = parts.slice(3).join('_');
        const reason = interaction.fields.getTextInputValue('reason');
        await submitLOA(interaction, type, start, end, dept, reason);
    } else if (interaction.customId === 'loa_custom_duration') {
        const start = new Date(interaction.fields.getTextInputValue('start_date'));
        const end = new Date(interaction.fields.getTextInputValue('end_date'));
        if (isNaN(start.getTime()) || isNaN(end.getTime()))
            return interaction.reply({ content: '❌ Invalid date format.', ephemeral: true });
        const reason = interaction.fields.getTextInputValue('reason');
        await submitLOA(interaction, 'Custom', start, end, 'General', reason);
    }
}

async function submitLOA(interaction: ModalSubmitInteraction, type: string, start: Date, end: Date, dept: string, reason: string) {
    const config = await GuildConfig.findOne({ guildId: interaction.guildId });
    if (!config) return interaction.reply({ content: '❌ Not configured.', ephemeral: true });
    if (end <= start) return interaction.reply({ content: '❌ End must be after start.', ephemeral: true });
    const days = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    if (days > config.maxLoaDuration) return interaction.reply({ content: '❌ Max ' + config.maxLoaDuration + ' days.', ephemeral: true });

    if (config.whitelistRoles.length > 0) {
        const member = await interaction.guild!.members.fetch(interaction.user.id);
        const hasRole = member.roles.cache.some(r => config.whitelistRoles.includes(r.id));
        if (!hasRole) return interaction.reply({ content: '❌ You are not authorized.', ephemeral: true });
    }

    const recent = await LOA.findOne({
        userId: interaction.user.id,
        guildId: interaction.guildId,
        createdAt: { $gte: new Date(Date.now() - config.cooldownHours * 3600000) }
    }).sort({ createdAt: -1 });
    if (recent) {
        const left = Math.ceil((recent.createdAt.getTime() + config.cooldownHours * 3600000 - Date.now()) / 3600000);
        return interaction.reply({ content: '⏰ Cooldown. Wait ' + left + 'h.', ephemeral: true });
    }
    const loaId = (LOA as any).generateLOAId();
    const loa = new LOA({ loaId, guildId: interaction.guildId, userId: interaction.user.id, type, reason, startDate: start, endDate: end, department: dept, status: 'pending' });
    await loa.save();

    const embed = new EmbedBuilder().setColor(0x5865F2).setTitle('📝 LOA Submitted')
        .addFields([{ name: 'ID', value: '#' + loaId, inline: true }, { name: 'Type', value: type, inline: true }, { name: 'Duration', value: days + ' days', inline: true }, { name: 'Reason', value: reason }])
        .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });

    if (config.logChannel) {
        const ch = interaction.guild!.channels.cache.get(config.logChannel);
        if (ch?.isTextBased()) {
            const logEmbed = new EmbedBuilder().setColor(0xFEE75C).setTitle('⏳ New LOA')
                .addFields([{ name: 'ID', value: '#' + loaId }, { name: 'User', value: '<@' + interaction.user.id + '>' }, { name: 'Type', value: type }, { name: 'Reason', value: reason }])
                .setTimestamp();
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId('loa_approve_' + loaId).setLabel('Approve').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('loa_deny_' + loaId).setLabel('Deny').setStyle(ButtonStyle.Danger)
            );
            await ch.send({ embeds: [logEmbed], components: [row] }).catch(() => {});
        }
    }
}

async function handleAutocomplete(interaction: AutocompleteInteraction, client: any) {
    const cmd = client.commands.get(interaction.commandName);
    if (cmd?.autocomplete) await cmd.autocomplete(interaction).catch(() => interaction.respond([]));
}

async function sendError(interaction: any) {
    try {
        if (interaction.replied || interaction.deferred) await interaction.followUp({ content: '❌ An error occurred.', ephemeral: true });
        else await interaction.reply({ content: '❌ An error occurred.', ephemeral: true });
    } catch {}
}

function createLOAEmbed(loa: any) {
    const colors: Record<string, number> = { pending: 0xFEE75C, approved: 0x57F287, denied: 0xED4245, cancelled: 0x95A5A6, expired: 0x95A5A6 };
    const emojis: Record<string, string> = { pending: '⏳', approved: '✅', denied: '❌', cancelled: '🚫', expired: '⏰' };
    return {
        color: colors[loa.status] || 0x5865F2,
        title: emojis[loa.status] + ' LOA #' + loa.loaId,
        fields: [
            { name: 'User', value: '<@' + loa.userId + '>', inline: true },
            { name: 'Type', value: loa.type, inline: true },
            { name: 'Status', value: loa.status.toUpperCase(), inline: true },
            { name: 'Start', value: '<t:' + Math.floor(loa.startDate.getTime() / 1000) + ':D>', inline: true },
            { name: 'End', value: '<t:' + Math.floor(loa.endDate.getTime() / 1000) + ':D>', inline: true },
            { name: 'Reason', value: loa.reason }
        ],
        timestamp: new Date().toISOString()
    };
}