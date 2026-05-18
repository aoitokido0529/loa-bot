"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const GuildConfig_1 = __importDefault(require("../models/GuildConfig"));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder().setName('setup').setDescription('✨ Setup the LOA bot').setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const exist = await GuildConfig_1.default.findOne({ guildId: interaction.guildId });
        if (exist)
            return interaction.reply({ content: '✅ Already configured. Use /loa config.', ephemeral: true });
        await interaction.deferReply({ ephemeral: true });
        const config = new GuildConfig_1.default({ guildId: interaction.guildId });
        const logCh = interaction.guild.channels.cache.find((c) => c.name.includes('log') || c.name.includes('loa'));
        if (logCh)
            config.logChannel = logCh.id;
        const staffR = interaction.guild.roles.cache.find((r) => r.name.toLowerCase().includes('staff') || r.name.toLowerCase().includes('mod'));
        if (staffR)
            config.staffRole = staffR.id;
        const adminR = interaction.guild.roles.cache.find((r) => r.name.toLowerCase().includes('admin') || r.name.toLowerCase().includes('management'));
        if (adminR)
            config.adminRoles = [adminR.id];
        const loaR = interaction.guild.roles.cache.find((r) => r.name.toLowerCase().includes('loa') || r.name.toLowerCase().includes('leave'));
        if (loaR)
            config.loaRole = loaR.id;
        await config.save();
        const embed = new discord_js_1.EmbedBuilder().setColor(0xCFB87C).setTitle('✅ Setup Complete').setDescription('Smart defaults applied.')
            .addFields([
            { name: '📝 Log Channel', value: logCh ? '<#' + logCh.id + '>' : 'Not set', inline: true },
            { name: '👥 Staff Role', value: staffR ? '<@&' + staffR.id + '>' : 'Not set', inline: true },
            { name: '👑 Admin Roles', value: adminR ? '<@&' + adminR.id + '>' : 'Not set', inline: true },
            { name: '🏷️ LOA Role', value: loaR ? '<@&' + loaR.id + '>' : 'Not set', inline: true }
        ]).setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    }
};
//# sourceMappingURL=setup.js.map