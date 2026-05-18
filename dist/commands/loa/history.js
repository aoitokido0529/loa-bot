"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const LOA_1 = __importDefault(require("../../models/LOA"));
const GuildConfig_1 = __importDefault(require("../../models/GuildConfig"));
const pagination_1 = __importDefault(require("../../utils/pagination"));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder().setName('loa').setDescription('History').addSubcommand(s => s.setName('history').setDescription('View history').addUserOption(o => o.setName('user').setDescription('User')).addStringOption(o => o.setName('filter').setDescription('Filter').addChoices({ name: 'All', value: 'all' }, { name: 'Approved', value: 'approved' }, { name: 'Denied', value: 'denied' }))),
    async execute(interaction) {
        const config = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
        if (!config)
            return interaction.reply({ content: 'Not configured.', ephemeral: true });
        const target = interaction.options.getUser('user') || interaction.user;
        if (target.id !== interaction.user.id) {
            const m = await interaction.guild.members.fetch(interaction.user.id);
            if (!m.roles.cache.has(config.staffRole ?? '') && !config.adminRoles.some(roleId => m.roles.cache.has(roleId)) && !m.permissions.has('Administrator'))
                return interaction.reply({ content: 'Own history only.', ephemeral: true });
        }
        const filter = interaction.options.getString('filter') || 'all';
        const q = { guildId: interaction.guildId, userId: target.id };
        if (filter !== 'all')
            q.status = filter;
        const loas = await LOA_1.default.find(q).sort({ createdAt: -1 }).limit(50);
        if (!loas.length)
            return interaction.reply({ embeds: [{ color: 0x5865F2, title: 'No History' }], ephemeral: true });
        const pages = [];
        for (let i = 0; i < loas.length; i += 5) {
            const embed = new discord_js_1.EmbedBuilder().setColor(0x5865F2).setTitle('History - ' + target.tag);
            for (const l of loas.slice(i, i + 5))
                embed.addFields({ name: '#' + l.loaId, value: l.type + ' - ' + l.status.toUpperCase() });
            pages.push({ embeds: [embed] });
        }
        new pagination_1.default(pages).start(interaction);
    }
};
//# sourceMappingURL=history.js.map