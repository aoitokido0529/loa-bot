"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const GuildConfig_1 = __importDefault(require("../models/GuildConfig"));
const LOA_1 = __importDefault(require("../models/LOA"));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('loarequest').setDescription('Submit a new LOA')
        .addStringOption(o => o.setName('type').setDescription('Type of LOA').setRequired(true).setAutocomplete(true))
        .addStringOption(o => o.setName('duration').setDescription('Duration').setRequired(true).addChoices({ name: '1 Day', value: '1d' }, { name: '3 Days', value: '3d' }, { name: '7 Days', value: '7d' }, { name: '14 Days', value: '14d' }, { name: '30 Days', value: '30d' }, { name: 'Custom', value: 'custom' }))
        .addStringOption(o => o.setName('department').setDescription('Department').setRequired(false).setAutocomplete(true)),
    cooldown: 10,
    async autocomplete(interaction) {
        const f = interaction.options.getFocused(true);
        const config = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
        let choices = [];
        if (f.name === 'type')
            choices = config?.loaTypes || ['Full LOA'];
        else if (f.name === 'department')
            choices = config?.departments || ['General'];
        const filtered = choices.filter((c) => c.toLowerCase().includes(f.value.toLowerCase()));
        await interaction.respond(filtered.map((c) => ({ name: c, value: c })));
    },
    async execute(interaction) {
        const config = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
        if (!config)
            return interaction.reply({ content: 'Use /setup first.', ephemeral: true });
        // Whitelist check
        if (config.whitelistRoles.length > 0) {
            const member = await interaction.guild.members.fetch(interaction.user.id);
            const hasRole = member.roles.cache.some((r) => config.whitelistRoles.includes(r.id));
            if (!hasRole)
                return interaction.reply({ content: '❌ You are not whitelisted to submit LOA requests.', ephemeral: true });
        }
        const recent = await LOA_1.default.findOne({ userId: interaction.user.id, guildId: interaction.guildId, createdAt: { $gte: new Date(Date.now() - config.cooldownHours * 3600000) } }).sort({ createdAt: -1 });
        if (recent) {
            const left = Math.ceil((recent.createdAt.getTime() + config.cooldownHours * 3600000 - Date.now()) / 3600000);
            return interaction.reply({ content: '⏰ Wait ' + left + 'h.', ephemeral: true });
        }
        const type = interaction.options.getString('type');
        const dur = interaction.options.getString('duration');
        const dept = interaction.options.getString('department') || 'General';
        if (dur === 'custom') {
            const modal = new discord_js_1.ModalBuilder().setCustomId('loa_custom_duration').setTitle('Custom LOA');
            modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder().setCustomId('start_date').setLabel('Start (YYYY-MM-DD)').setStyle(discord_js_1.TextInputStyle.Short).setPlaceholder('2024-01-01').setRequired(true)), new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder().setCustomId('end_date').setLabel('End (YYYY-MM-DD)').setStyle(discord_js_1.TextInputStyle.Short).setPlaceholder('2024-01-07').setRequired(true)), new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder().setCustomId('reason').setLabel('Reason').setStyle(discord_js_1.TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000)));
            return interaction.showModal(modal);
        }
        const days = parseInt(dur);
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + days);
        const modal = new discord_js_1.ModalBuilder().setCustomId('loa_reason_' + type + '_' + start.toISOString() + '_' + end.toISOString() + '_' + dept).setTitle('LOA Reason');
        modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder().setCustomId('reason').setLabel('Reason').setStyle(discord_js_1.TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000)));
        await interaction.showModal(modal);
    }
};
//# sourceMappingURL=loarequest.js.map