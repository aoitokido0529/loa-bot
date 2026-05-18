import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import LOA from '../../models/LOA';
import GuildConfig from '../../models/GuildConfig';
export default {
    data: new SlashCommandBuilder().setName('loa').setDescription('Cancel').addSubcommand(s => s.setName('cancel').setDescription('Cancel a LOA').addStringOption(o => o.setName('id').setDescription('LOA ID').setRequired(true).setAutocomplete(true))),
    async autocomplete(interaction: any) {
        const cfg = await GuildConfig.findOne({ guildId: interaction.guildId });
        const mem = await interaction.guild.members.fetch(interaction.user.id);
        const isStaff = mem.roles.cache.has(cfg?.staffRole ?? '') || cfg?.adminRoles.some(r => mem.roles.cache.has(r)) || mem.permissions.has('Administrator');
        const q: any = { guildId: interaction.guildId, status: { $in: ['pending', 'approved'] }, loaId: { $regex: interaction.options.getFocused(), $options: 'i' } };
        if (!isStaff) q.userId = interaction.user.id;
        const loas = await LOA.find(q).limit(25);
        await interaction.respond(loas.map((l: any) => ({ name: '#' + l.loaId, value: l.loaId })));
    },
    async execute(interaction: any) {
        const loa = await LOA.findOne({ loaId: interaction.options.getString('id'), guildId: interaction.guildId });
        if (!loa) return interaction.reply({ content: 'Not found.', ephemeral: true });
        const cfg = await GuildConfig.findOne({ guildId: interaction.guildId });
        const mem = await interaction.guild.members.fetch(interaction.user.id);
        const isStaff = mem.roles.cache.has(cfg?.staffRole ?? '') || cfg?.adminRoles.some(r => mem.roles.cache.has(r)) || mem.permissions.has('Administrator');
        if (loa.userId !== interaction.user.id && !isStaff) return interaction.reply({ content: 'Cannot cancel.', ephemeral: true });
        loa.status = 'cancelled'; loa.cancelledBy = interaction.user.id; loa.cancelledAt = new Date();
        await loa.save();
        if (cfg?.loaRole) { const m = await interaction.guild.members.fetch(loa.userId).catch(() => null); if (m) await m.roles.remove(cfg.loaRole).catch(() => {}); }
        await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x95A5A6).setTitle('Cancelled').setDescription('#' + loa.loaId + ' cancelled')] });
    }
};