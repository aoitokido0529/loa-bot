"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const LOA_1 = __importDefault(require("../../models/LOA"));
const GuildConfig_1 = __importDefault(require("../../models/GuildConfig"));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder().setName('loa').setDescription('Cancel').addSubcommand(s => s.setName('cancel').setDescription('Cancel').addStringOption(o => o.setName('id').setDescription('LOA ID').setRequired(true).setAutocomplete(true))),
    async autocomplete(interaction) {
        const config = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const isStaff = member.roles.cache.has(config?.staffRole ?? '') || config?.adminRoles.some(roleId => member.roles.cache.has(roleId)) || member.permissions.has('Administrator');
        const q = { guildId: interaction.guildId, status: { $in: ['pending', 'approved'] }, loaId: { $regex: interaction.options.getFocused(), $options: 'i' } };
        if (!isStaff)
            q.userId = interaction.user.id;
        const loas = await LOA_1.default.find(q).limit(25);
        await interaction.respond(loas.map((l) => ({ name: '#' + l.loaId, value: l.loaId })));
    },
    async execute(interaction) {
        const loa = await LOA_1.default.findOne({ loaId: interaction.options.getString('id'), guildId: interaction.guildId });
        if (!loa)
            return interaction.reply({ content: 'Not found.', ephemeral: true });
        const config = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const isStaff = member.roles.cache.has(config?.staffRole ?? '') || config?.adminRoles.some(roleId => member.roles.cache.has(roleId)) || member.permissions.has('Administrator');
        if (loa.userId !== interaction.user.id && !isStaff)
            return interaction.reply({ content: 'Cannot cancel.', ephemeral: true });
        loa.status = 'cancelled';
        loa.cancelledBy = interaction.user.id;
        loa.cancelledAt = new Date();
        await loa.save();
        if (config?.loaRole) {
            const m = await interaction.guild.members.fetch(loa.userId).catch(() => null);
            if (m)
                await m.roles.remove(config.loaRole).catch(() => { });
        }
        await interaction.reply({ embeds: [new discord_js_1.EmbedBuilder().setColor(0x95A5A6).setTitle('Cancelled').setDescription('#' + loa.loaId + ' cancelled')] });
    }
};
//# sourceMappingURL=cancel.js.map