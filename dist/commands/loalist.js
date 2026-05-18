"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const LOA_1 = __importDefault(require("../models/LOA"));
const GuildConfig_1 = __importDefault(require("../models/GuildConfig"));
const pagination_1 = __importDefault(require("../utils/pagination"));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('loalist').setDescription('View LOAs')
        .addStringOption(o => o.setName('filter').setDescription('Filter').addChoices({ name: 'All', value: 'all' }, { name: 'Pending', value: 'pending' }, { name: 'Approved', value: 'approved' }, { name: 'Active', value: 'active' }))
        .addStringOption(o => o.setName('department').setDescription('Department').setAutocomplete(true))
        .addUserOption(o => o.setName('user').setDescription('User')),
    async autocomplete(interaction) {
        const config = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
        const depts = config?.departments || ['General'];
        const filt = depts.filter((d) => d.toLowerCase().includes(interaction.options.getFocused().toLowerCase()));
        await interaction.respond(filt.map((d) => ({ name: d, value: d })));
    },
    async execute(interaction) {
        const config = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
        if (!config)
            return interaction.reply({ content: 'Use /setup first.', ephemeral: true });
        const filter = interaction.options.getString('filter') || 'all';
        const dept = interaction.options.getString('department');
        const user = interaction.options.getUser('user');
        const query = { guildId: interaction.guildId };
        if (filter === 'active') {
            query.status = 'approved';
            query.endDate = { $gte: new Date() };
        }
        else if (filter !== 'all')
            query.status = filter;
        if (dept)
            query.department = dept;
        if (user)
            query.userId = user.id;
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const isStaff = member.roles.cache.has(config.staffRole ?? '') || config.adminRoles.some(roleId => member.roles.cache.has(roleId)) || member.permissions.has('Administrator');
        if (!isStaff)
            query.userId = interaction.user.id;
        const loas = await LOA_1.default.find(query).sort({ createdAt: -1 }).limit(50);
        if (!loas.length)
            return interaction.reply({ embeds: [{ color: 0x5865F2, title: 'No LOAs' }], ephemeral: true });
        const pages = [];
        for (let i = 0; i < loas.length; i += 5) {
            const embed = new discord_js_1.EmbedBuilder().setColor(0x5865F2).setTitle('LOA List');
            for (const l of loas.slice(i, i + 5))
                embed.addFields({ name: '#' + l.loaId, value: '<@' + l.userId + '> - ' + l.type + ' - ' + l.status.toUpperCase() });
            pages.push({ embeds: [embed] });
        }
        new pagination_1.default(pages).start(interaction);
    }
};
//# sourceMappingURL=loalist.js.map