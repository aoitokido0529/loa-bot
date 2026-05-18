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
        .setName('loalist').setDescription('📋 View LOAs')
        .addStringOption(o => o.setName('filter').setDescription('Filter').addChoices({ name: 'All', value: 'all' }, { name: 'Pending', value: 'pending' }, { name: 'Approved', value: 'approved' }, { name: 'Active', value: 'active' }))
        .addStringOption(o => o.setName('department').setDescription('Department').setAutocomplete(true))
        .addUserOption(o => o.setName('user').setDescription('User')),
    async autocomplete(interaction) {
        const cfg = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
        const depts = cfg?.departments || ['General'];
        const f = interaction.options.getFocused();
        await interaction.respond(depts.filter((d) => d.toLowerCase().includes(f.toLowerCase())).map((d) => ({ name: d, value: d })));
    },
    async execute(interaction) {
        const cfg = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
        if (!cfg)
            return interaction.reply({ content: 'Use /setup first.', ephemeral: true });
        const filter = interaction.options.getString('filter') || 'all';
        const dept = interaction.options.getString('department');
        const user = interaction.options.getUser('user');
        const q = { guildId: interaction.guildId };
        if (filter === 'active') {
            q.status = 'approved';
            q.endDate = { $gte: new Date() };
        }
        else if (filter !== 'all')
            q.status = filter;
        if (dept)
            q.department = dept;
        if (user)
            q.userId = user.id;
        const mem = await interaction.guild.members.fetch(interaction.user.id);
        const isStaff = mem.roles.cache.has(cfg.staffRole ?? '') || cfg.adminRoles.some(r => mem.roles.cache.has(r)) || mem.permissions.has('Administrator');
        if (!isStaff)
            q.userId = interaction.user.id;
        const loas = await LOA_1.default.find(q).sort({ createdAt: -1 }).limit(50);
        if (!loas.length)
            return interaction.reply({ embeds: [{ color: 0xCFB87C, title: 'No LOAs' }], ephemeral: true });
        const pages = [];
        for (let i = 0; i < loas.length; i += 5) {
            const emb = new discord_js_1.EmbedBuilder().setColor(0xCFB87C).setTitle('LOA List');
            for (const l of loas.slice(i, i + 5)) {
                const emoji = { pending: '⏳', approved: '✅', denied: '❌', cancelled: '🚫', expired: '⏰' }[l.status] || '❓';
                emb.addFields({ name: emoji + ' #' + l.loaId, value: '<@' + l.userId + '> - ' + l.type + ' - ' + l.status.toUpperCase() });
            }
            pages.push({ embeds: [emb] });
        }
        new pagination_1.default(pages).start(interaction);
    }
};
//# sourceMappingURL=loalist.js.map