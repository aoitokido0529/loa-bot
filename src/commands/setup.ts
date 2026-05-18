import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import GuildConfig from '../models/GuildConfig';

export default {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup the LOA bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction: any) {
        const exist = await GuildConfig.findOne({ guildId: interaction.guildId });
        if (exist) {
            return interaction.reply({ content: 'Already configured. Use `/loa config` to modify.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const config = new GuildConfig({ guildId: interaction.guildId });

        // Smart defaults
        const logCh = interaction.guild.channels.cache.find(
            (c: any) => c.name.includes('log') || c.name.includes('loa')
        );
        if (logCh) config.logChannel = logCh.id;

        const staffR = interaction.guild.roles.cache.find(
            (r: any) => r.name.toLowerCase().includes('staff') || r.name.toLowerCase().includes('mod')
        );
        if (staffR) config.staffRole = staffR.id;

        const adminR = interaction.guild.roles.cache.find(
            (r: any) => r.name.toLowerCase().includes('admin') || r.name.toLowerCase().includes('management')
        );
        // Store as array (multiple admin roles supported)
        if (adminR) config.adminRoles = [adminR.id];

        const loaR = interaction.guild.roles.cache.find(
            (r: any) => r.name.toLowerCase().includes('loa') || r.name.toLowerCase().includes('leave')
        );
        if (loaR) config.loaRole = loaR.id;

        await config.save();

        const embed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('✅ LOA Bot Setup Complete')
            .setDescription('The bot has been configured with smart defaults. Use `/loa config` to add more admin roles or adjust settings.')
            .addFields([
                { name: '📝 Log Channel', value: logCh ? `<#${logCh.id}>` : 'Not set', inline: true },
                { name: '👥 Staff Role', value: staffR ? `<@&${staffR.id}>` : 'Not set', inline: true },
                { name: '👑 Admin Roles', value: adminR ? `<@&${adminR.id}>` : 'Not set (only Administrators)', inline: true },
                { name: '🏷️ LOA Role', value: loaR ? `<@&${loaR.id}>` : 'Not set', inline: true }
            ])
            .setFooter({ text: 'Use /loa config to modify any setting' })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};