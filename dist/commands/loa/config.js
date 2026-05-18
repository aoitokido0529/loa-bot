"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const GuildConfig_1 = __importDefault(require("../../models/GuildConfig"));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('loa')
        .setDescription('Configure the bot')
        .addSubcommand(sub => sub.setName('config')
        .setDescription('⚙️ View or modify bot configuration')
        .addStringOption(o => o.setName('setting').setDescription('Setting to modify')
        .addChoices({ name: '📝 Log Channel', value: 'logChannel' }, { name: '👥 Staff Role', value: 'staffRole' }, { name: '👑 Admin Roles', value: 'adminRoles' }, { name: '🏷️ LOA Role', value: 'loaRole' }, { name: '📅 Max Duration', value: 'maxLoaDuration' }, { name: '⏰ Cooldown Hours', value: 'cooldownHours' }))
        .addStringOption(o => o.setName('value').setDescription('New value(s) for the setting'))),
    async execute(interaction) {
        const config = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
        if (!config) {
            await interaction.reply({ content: '❌ Use `/setup` first.', ephemeral: true });
            return;
        }
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const isAdmin = config.adminRoles.some((roleId) => member.roles.cache.has(roleId))
            || member.permissions.has('Administrator');
        if (!isAdmin) {
            await interaction.reply({ content: '❌ You need an admin role or Administrator permission.', ephemeral: true });
            return;
        }
        const setting = interaction.options.getString('setting');
        const value = interaction.options.getString('value');
        if (!setting) {
            // Show current configuration
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('⚙️ LOA Bot Configuration')
                .addFields([
                { name: '📝 Log Channel', value: config.logChannel ? `<#${config.logChannel}>` : 'Not set', inline: true },
                { name: '👥 Staff Role', value: config.staffRole ? `<@&${config.staffRole}>` : 'Not set', inline: true },
                { name: '👑 Admin Roles', value: config.adminRoles.length > 0
                        ? config.adminRoles.map(id => `<@&${id}>`).join(', ')
                        : 'Not set (only Administrators)', inline: false },
                { name: '🏷️ LOA Role', value: config.loaRole ? `<@&${config.loaRole}>` : 'Not set', inline: true },
                { name: '📅 Max Duration', value: `${config.maxLoaDuration} days`, inline: true },
                { name: '⏰ Cooldown', value: `${config.cooldownHours} hours`, inline: true }
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (!value) {
            await interaction.reply({ content: '❌ Please provide a value.', ephemeral: true });
            return;
        }
        // Helper to resolve a single role from a string (mention, ID, or name)
        const resolveRole = async (input) => {
            // Try mention <@&123...>
            let m = input.match(/<@&(\d+)>/);
            if (m)
                return m[1];
            // Try raw number
            m = input.match(/^(\d{17,20})$/);
            if (m) {
                const role = interaction.guild.roles.cache.get(m[1]);
                if (role)
                    return role.id;
            }
            // Search by name (case-insensitive)
            const role = interaction.guild.roles.cache.find((r) => r.name.toLowerCase() === input.toLowerCase());
            return role ? role.id : null;
        };
        // Helper to resolve a comma-separated list of roles
        const resolveRoles = async (input) => {
            const parts = input.split(',').map(p => p.trim()).filter(Boolean);
            const ids = [];
            for (const part of parts) {
                const id = await resolveRole(part);
                if (!id)
                    return null; // one failed, abort
                ids.push(id);
            }
            return ids;
        };
        switch (setting) {
            case 'logChannel': {
                const m = value.match(/<#(\d+)>/) || value.match(/^(\d+)$/);
                if (!m) {
                    // Try to find channel by name
                    const ch = interaction.guild.channels.cache.find((c) => c.name.toLowerCase() === value.toLowerCase() && c.isTextBased());
                    if (!ch) {
                        await interaction.reply({ content: '❌ Could not find that channel. Use #mention or ID.', ephemeral: true });
                        return;
                    }
                    config.logChannel = ch.id;
                }
                else {
                    config.logChannel = m[1];
                }
                break;
            }
            case 'staffRole': {
                const roleId = await resolveRole(value);
                if (!roleId) {
                    await interaction.reply({ content: '❌ Could not find that role. Use @mention, ID, or exact name.', ephemeral: true });
                    return;
                }
                config.staffRole = roleId;
                break;
            }
            case 'adminRoles': {
                const roleIds = await resolveRoles(value);
                if (!roleIds) {
                    await interaction.reply({ content: '❌ One or more roles could not be found. Use @mentions, IDs, or exact names separated by commas.', ephemeral: true });
                    return;
                }
                config.adminRoles = roleIds;
                break;
            }
            case 'loaRole': {
                const roleId = await resolveRole(value);
                if (!roleId) {
                    await interaction.reply({ content: '❌ Could not find that role. Use @mention, ID, or exact name.', ephemeral: true });
                    return;
                }
                config.loaRole = roleId;
                break;
            }
            case 'maxLoaDuration': {
                const n = parseInt(value);
                if (isNaN(n) || n < 1 || n > 365) {
                    await interaction.reply({ content: '❌ Must be a number between 1 and 365.', ephemeral: true });
                    return;
                }
                config.maxLoaDuration = n;
                break;
            }
            case 'cooldownHours': {
                const n = parseInt(value);
                if (isNaN(n) || n < 0 || n > 720) {
                    await interaction.reply({ content: '❌ Must be a number between 0 and 720.', ephemeral: true });
                    return;
                }
                config.cooldownHours = n;
                break;
            }
        }
        await config.save();
        await interaction.reply({
            embeds: [new discord_js_1.EmbedBuilder().setColor(0x57F287).setTitle('✅ Updated').setDescription(`**${setting}** → **${value}**`).setTimestamp()],
            ephemeral: true
        });
    }
};
//# sourceMappingURL=config.js.map