"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const GuildConfig_1 = __importDefault(require("../models/GuildConfig"));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('loawl')
        .setDescription('Manage role whitelist for LOA submissions')
        .addSubcommand(sub => sub.setName('add').setDescription('Add a role to the whitelist').addRoleOption(o => o.setName('role').setDescription('Role to add').setRequired(true)))
        .addSubcommand(sub => sub.setName('remove').setDescription('Remove a role from the whitelist').addRoleOption(o => o.setName('role').setDescription('Role to remove').setRequired(true)))
        .addSubcommand(sub => sub.setName('list').setDescription('List whitelisted roles'))
        .setDefaultMemberPermissions('0'),
    async execute(interaction) {
        const config = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
        if (!config)
            return interaction.reply({ content: '❌ Not configured. Use /setup.', ephemeral: true });
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!config.adminRoles.some(roleId => member.roles.cache.has(roleId)) && !member.permissions.has('Administrator'))
            return interaction.reply({ content: '❌ Admin only.', ephemeral: true });
        const sub = interaction.options.getSubcommand();
        const role = interaction.options.getRole('role');
        if (sub === 'add') {
            if (config.whitelistRoles.includes(role.id))
                return interaction.reply({ content: '⚠️ Role is already whitelisted.', ephemeral: true });
            config.whitelistRoles.push(role.id);
            await config.save();
            const embed = new discord_js_1.EmbedBuilder().setColor(0x57F287).setTitle('✅ Whitelist Updated').setDescription('Added <@&' + role.id + '> to whitelist.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        else if (sub === 'remove') {
            const idx = config.whitelistRoles.indexOf(role.id);
            if (idx === -1)
                return interaction.reply({ content: '⚠️ Role is not in the whitelist.', ephemeral: true });
            config.whitelistRoles.splice(idx, 1);
            await config.save();
            const embed = new discord_js_1.EmbedBuilder().setColor(0xED4245).setTitle('❌ Whitelist Updated').setDescription('Removed <@&' + role.id + '> from whitelist.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        else if (sub === 'list') {
            if (config.whitelistRoles.length === 0)
                return interaction.reply({ content: '📋 Whitelist is empty. Anyone can submit LOAs.', ephemeral: true });
            const roles = config.whitelistRoles.map(id => '<@&' + id + '>').join(', ');
            const embed = new discord_js_1.EmbedBuilder().setColor(0x5865F2).setTitle('🛡️ Whitelisted Roles').setDescription(roles).setFooter({ text: 'Only members with these roles can submit LOA requests' });
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
//# sourceMappingURL=loawl.js.map