import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import GuildConfig from '../models/GuildConfig';
export default {
    data: new SlashCommandBuilder().setName('setup').setDescription('✨ Setup the LOA bot').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction: any) {
        const exist = await GuildConfig.findOne({ guildId: interaction.guildId });
        if (exist) return interaction.reply({ content: '✅ Already configured. Use /loa config.', ephemeral: true });
        await interaction.deferReply({ ephemeral: true });
        const config = new GuildConfig({ guildId: interaction.guildId });
        const logCh = interaction.guild.channels.cache.find((c: any) => c.name.includes('log') || c.name.includes('loa'));
        if (logCh) config.logChannel = logCh.id;
        const staffR = interaction.guild.roles.cache.find((r: any) => r.name.toLowerCase().includes('staff') || r.name.toLowerCase().includes('mod'));
        if (staffR) config.staffRole = staffR.id;
        const adminR = interaction.guild.roles.cache.find((r: any) => r.name.toLowerCase().includes('admin') || r.name.toLowerCase().includes('management'));
        if (adminR) config.adminRoles = [adminR.id];
        const loaR = interaction.guild.roles.cache.find((r: any) => r.name.toLowerCase().includes('loa') || r.name.toLowerCase().includes('leave'));
        if (loaR) config.loaRole = loaR.id;
        await config.save();
        const embed = new EmbedBuilder().setColor(0xCFB87C).setTitle('✅ Setup Complete').setDescription('Smart defaults applied.')
            .addFields([
                { name: '📝 Log Channel', value: logCh ? '<#' + logCh.id + '>' : 'Not set', inline: true },
                { name: '👥 Staff Role', value: staffR ? '<@&' + staffR.id + '>' : 'Not set', inline: true },
                { name: '👑 Admin Roles', value: adminR ? '<@&' + adminR.id + '>' : 'Not set', inline: true },
                { name: '🏷️ LOA Role', value: loaR ? '<@&' + loaR.id + '>' : 'Not set', inline: true }
            ]).setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    }
};