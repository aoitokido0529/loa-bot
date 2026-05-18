"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const GuildConfig_1 = __importDefault(require("../../models/GuildConfig"));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder().setName('loa').setDescription('Config').addSubcommand(s => s.setName('config').setDescription('Modify configuration').addStringOption(o => o.setName('setting').setDescription('Setting').addChoices({ name: 'Log Channel', value: 'logChannel' }, { name: 'Staff Role', value: 'staffRole' }, { name: 'Admin Roles', value: 'adminRoles' }, { name: 'LOA Role', value: 'loaRole' }, { name: 'Max Duration', value: 'maxLoaDuration' }, { name: 'Cooldown Hours', value: 'cooldownHours' })).addStringOption(o => o.setName('value').setDescription('New value(s)'))),
    async execute(interaction) {
        const cfg = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
        if (!cfg)
            return interaction.reply({ content: 'Use /setup first.', ephemeral: true });
        const mem = await interaction.guild.members.fetch(interaction.user.id);
        if (!cfg.adminRoles.some(r => mem.roles.cache.has(r)) && !mem.permissions.has('Administrator'))
            return interaction.reply({ content: 'Admin only.', ephemeral: true });
        const setting = interaction.options.getString('setting');
        const value = interaction.options.getString('value');
        if (!setting) {
            const embed = new discord_js_1.EmbedBuilder().setColor(0xCFB87C).setTitle('⚙️ Configuration')
                .addFields([
                { name: 'Log Channel', value: cfg.logChannel ? '<#' + cfg.logChannel + '>' : 'Not set', inline: true },
                { name: 'Staff Role', value: cfg.staffRole ? '<@&' + cfg.staffRole + '>' : 'Not set', inline: true },
                { name: 'Admin Roles', value: cfg.adminRoles.length ? cfg.adminRoles.map(id => '<@&' + id + '>').join(', ') : 'Not set', inline: false },
                { name: 'LOA Role', value: cfg.loaRole ? '<@&' + cfg.loaRole + '>' : 'Not set', inline: true },
                { name: 'Max Duration', value: cfg.maxLoaDuration + ' days', inline: true },
                { name: 'Cooldown', value: cfg.cooldownHours + ' hours', inline: true }
            ]);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (!value)
            return interaction.reply({ content: 'Provide a value.', ephemeral: true });
        const resolveRole = async (input) => {
            let m = input.match(/<@&(\d+)>/);
            if (m)
                return m[1];
            m = input.match(/^(\d{17,20})$/);
            if (m) {
                const r = interaction.guild.roles.cache.get(m[1]);
                if (r)
                    return r.id;
            }
            const r = interaction.guild.roles.cache.find((rr) => rr.name.toLowerCase() === input.toLowerCase());
            return r ? r.id : null;
        };
        const resolveRoles = async (inp) => {
            const parts = inp.split(',').map(p => p.trim()).filter(Boolean);
            const ids = [];
            for (const p of parts) {
                const id = await resolveRole(p);
                if (!id)
                    return null;
                ids.push(id);
            }
            return ids;
        };
        switch (setting) {
            case 'logChannel': {
                let m = value.match(/<#(\d+)>/) || value.match(/^(\d+)$/);
                if (!m) {
                    const ch = interaction.guild.channels.cache.find((c) => c.name.toLowerCase() === value.toLowerCase() && c.isTextBased());
                    if (!ch)
                        return interaction.reply({ content: 'Invalid channel.', ephemeral: true });
                    cfg.logChannel = ch.id;
                }
                else
                    cfg.logChannel = m[1];
                break;
            }
            case 'staffRole': {
                const id = await resolveRole(value);
                if (!id)
                    return interaction.reply({ content: 'Invalid role.', ephemeral: true });
                cfg.staffRole = id;
                break;
            }
            case 'adminRoles': {
                const ids = await resolveRoles(value);
                if (!ids)
                    return interaction.reply({ content: 'Invalid roles.', ephemeral: true });
                cfg.adminRoles = ids;
                break;
            }
            case 'loaRole': {
                const id = await resolveRole(value);
                if (!id)
                    return interaction.reply({ content: 'Invalid role.', ephemeral: true });
                cfg.loaRole = id;
                break;
            }
            case 'maxLoaDuration': {
                const n = parseInt(value);
                if (isNaN(n) || n < 1 || n > 365)
                    return interaction.reply({ content: '1-365.', ephemeral: true });
                cfg.maxLoaDuration = n;
                break;
            }
            case 'cooldownHours': {
                const n = parseInt(value);
                if (isNaN(n) || n < 0 || n > 720)
                    return interaction.reply({ content: '0-720.', ephemeral: true });
                cfg.cooldownHours = n;
                break;
            }
        }
        await cfg.save();
        await interaction.reply({ embeds: [new discord_js_1.EmbedBuilder().setColor(0x57F287).setTitle('Updated').setDescription(setting + ' = ' + value)], ephemeral: true });
    }
};
//# sourceMappingURL=config.js.map