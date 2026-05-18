import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import LOA from '../../models/LOA';
import GuildConfig from '../../models/GuildConfig';
export default {
    data: new SlashCommandBuilder().setName('loa').setDescription('Approve').addSubcommand(s => s.setName('approve').setDescription('Approve a pending LOA').addStringOption(o => o.setName('id').setDescription('LOA ID').setRequired(true).setAutocomplete(true))),
    async autocomplete(interaction: any) {
        const cfg = await GuildConfig.findOne({ guildId: interaction.guildId });
        const mem = await interaction.guild.members.fetch(interaction.user.id);
        if (!mem.roles.cache.has(cfg?.staffRole ?? '') && !cfg?.adminRoles.some(r => mem.roles.cache.has(r)) && !mem.permissions.has('Administrator')) return interaction.respond([]);
        const loas = await LOA.find({ guildId: interaction.guildId, status: 'pending', loaId: { $regex: interaction.options.getFocused(), $options: 'i' } }).limit(25);
        await interaction.respond(loas.map((l: any) => ({ name: '#' + l.loaId, value: l.loaId })));
    },
    async execute(interaction: any) {
        const cfg = await GuildConfig.findOne({ guildId: interaction.guildId });
        if (!cfg) return interaction.reply({ content: 'Not configured.', ephemeral: true });
        const mem = await interaction.guild.members.fetch(interaction.user.id);
        if (!mem.roles.cache.has(cfg.staffRole ?? '') && !cfg.adminRoles.some(r => mem.roles.cache.has(r)) && !mem.permissions.has('Administrator')) return interaction.reply({ content: 'No permission.', ephemeral: true });
        const loa = await LOA.findOne({ loaId: interaction.options.getString('id'), guildId: interaction.guildId });
        if (!loa) return interaction.reply({ content: 'Not found.', ephemeral: true });
        loa.status = 'approved'; loa.approvedBy = interaction.user.id; loa.approvedAt = new Date();
        await loa.save();
        if (cfg.loaRole) { const m = await interaction.guild.members.fetch(loa.userId).catch(() => null); if (m) await m.roles.add(cfg.loaRole).catch(() => {}); }
        await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57F287).setTitle('Approved').setDescription('#' + loa.loaId + ' approved')] });
    }
};