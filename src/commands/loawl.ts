import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import GuildConfig from '../models/GuildConfig';
export default {
    data: new SlashCommandBuilder()
        .setName('loawl').setDescription('🛡️ Whitelist management')
        .addSubcommand(s => s.setName('add').setDescription('Add role to whitelist').addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)))
        .addSubcommand(s => s.setName('remove').setDescription('Remove role from whitelist').addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)))
        .addSubcommand(s => s.setName('list').setDescription('List whitelisted roles'))
        .setDefaultMemberPermissions('0'),
    async execute(interaction: any) {
        const cfg = await GuildConfig.findOne({ guildId: interaction.guildId });
        if (!cfg) return interaction.reply({ content: 'Not configured.', ephemeral: true });
        const mem = await interaction.guild.members.fetch(interaction.user.id);
        if (!cfg.adminRoles.some(r => mem.roles.cache.has(r)) && !mem.permissions.has('Administrator')) return interaction.reply({ content: 'Admin only.', ephemeral: true });
        const sub = interaction.options.getSubcommand();
        const role = interaction.options.getRole('role');
        if (sub === 'add') {
            if (cfg.whitelistRoles.includes(role.id)) return interaction.reply({ content: 'Already whitelisted.', ephemeral: true });
            cfg.whitelistRoles.push(role.id);
            await cfg.save();
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57F287).setTitle('✅ Added').setDescription('<@&' + role.id + '> added to whitelist.')], ephemeral: true });
        } else if (sub === 'remove') {
            const idx = cfg.whitelistRoles.indexOf(role.id);
            if (idx === -1) return interaction.reply({ content: 'Not in whitelist.', ephemeral: true });
            cfg.whitelistRoles.splice(idx, 1);
            await cfg.save();
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xED4245).setTitle('❌ Removed').setDescription('<@&' + role.id + '> removed from whitelist.')], ephemeral: true });
        } else {
            if (!cfg.whitelistRoles.length) return interaction.reply({ content: 'Whitelist empty.', ephemeral: true });
            const list = cfg.whitelistRoles.map(id => '<@&' + id + '>').join(', ');
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xCFB87C).setTitle('🛡️ Whitelisted Roles').setDescription(list)] });
        }
    }
};