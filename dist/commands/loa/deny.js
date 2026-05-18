"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const LOA_1 = __importDefault(require("../../models/LOA"));
const GuildConfig_1 = __importDefault(require("../../models/GuildConfig"));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder().setName('loa').setDescription('Deny').addSubcommand(s => s.setName('deny').setDescription('Deny').addStringOption(o => o.setName('id').setDescription('LOA ID').setRequired(true).setAutocomplete(true)).addStringOption(o => o.setName('reason').setDescription('Reason'))),
    async autocomplete(interaction) {
        const config = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.roles.cache.has(config?.staffRole ?? '') && !config?.adminRoles.some(roleId => member.roles.cache.has(roleId)) && !member.permissions.has('Administrator'))
            return interaction.respond([]);
        const loas = await LOA_1.default.find({ guildId: interaction.guildId, status: 'pending', loaId: { $regex: interaction.options.getFocused(), $options: 'i' } }).limit(25);
        await interaction.respond(loas.map((l) => ({ name: '#' + l.loaId, value: l.loaId })));
    },
    async execute(interaction) {
        const config = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
        if (!config)
            return interaction.reply({ content: 'Not configured.', ephemeral: true });
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.roles.cache.has(config.staffRole ?? '') && !config.adminRoles.some(roleId => member.roles.cache.has(roleId)) && !member.permissions.has('Administrator'))
            return interaction.reply({ content: 'No permission.', ephemeral: true });
        const loa = await LOA_1.default.findOne({ loaId: interaction.options.getString('id'), guildId: interaction.guildId });
        if (!loa)
            return interaction.reply({ content: 'Not found.', ephemeral: true });
        loa.status = 'denied';
        loa.deniedBy = interaction.user.id;
        loa.deniedAt = new Date();
        await loa.save();
        await interaction.reply({ embeds: [new discord_js_1.EmbedBuilder().setColor(0xED4245).setTitle('Denied').setDescription('#' + loa.loaId + ' denied')] });
    }
};
//# sourceMappingURL=deny.js.map