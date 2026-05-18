"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const LOA_1 = __importDefault(require("../../models/LOA"));
const GuildConfig_1 = __importDefault(require("../../models/GuildConfig"));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder().setName('loa').setDescription('Deny').addSubcommand(s => s.setName('deny').setDescription('Deny a pending LOA').addStringOption(o => o.setName('id').setDescription('LOA ID').setRequired(true).setAutocomplete(true)).addStringOption(o => o.setName('reason').setDescription('Reason'))),
    async autocomplete(interaction) {
        const cfg = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
        const mem = await interaction.guild.members.fetch(interaction.user.id);
        if (!mem.roles.cache.has(cfg?.staffRole ?? '') && !cfg?.adminRoles.some(r => mem.roles.cache.has(r)) && !mem.permissions.has('Administrator'))
            return interaction.respond([]);
        const loas = await LOA_1.default.find({ guildId: interaction.guildId, status: 'pending', loaId: { $regex: interaction.options.getFocused(), $options: 'i' } }).limit(25);
        await interaction.respond(loas.map((l) => ({ name: '#' + l.loaId, value: l.loaId })));
    },
    async execute(interaction) {
        const cfg = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
        if (!cfg)
            return interaction.reply({ content: 'Not configured.', ephemeral: true });
        const mem = await interaction.guild.members.fetch(interaction.user.id);
        if (!mem.roles.cache.has(cfg.staffRole ?? '') && !cfg.adminRoles.some(r => mem.roles.cache.has(r)) && !mem.permissions.has('Administrator'))
            return interaction.reply({ content: 'No permission.', ephemeral: true });
        const loa = await LOA_1.default.findOne({ loaId: interaction.options.getString('id'), guildId: interaction.guildId });
        if (!loa)
            return interaction.reply({ content: 'Not found.', ephemeral: true });
        loa.status = 'denied';
        loa.deniedBy = interaction.user.id;
        loa.deniedAt = new Date();
        await loa.save();
        const reason = interaction.options.getString('reason') || 'No reason';
        await interaction.reply({ embeds: [new discord_js_1.EmbedBuilder().setColor(0xED4245).setTitle('Denied').setDescription('#' + loa.loaId + ' denied. Reason: ' + reason)] });
    }
};
//# sourceMappingURL=deny.js.map