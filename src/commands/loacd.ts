import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import LOA from '../models/LOA';
import GuildConfig from '../models/GuildConfig';

export default {
    data: new SlashCommandBuilder()
        .setName('loacd')
        .setDescription('⏰ Check or clear LOA cooldown')
        .addSubcommand(sub =>
            sub.setName('check')
                .setDescription('Check cooldown status')
                .addUserOption(o => o.setName('user').setDescription('User to check (leave empty for yourself)'))
        )
        .addSubcommand(sub =>
            sub.setName('clear')
                .setDescription('Clear a user’s cooldown (Admin only)')
                .addUserOption(o => o.setName('user').setDescription('User to clear cooldown for').setRequired(true))
        ),

    async execute(interaction: any) {
        const config = await GuildConfig.findOne({ guildId: interaction.guildId });
        if (!config) {
            await interaction.reply({ content: '❌ Use `/setup` first.', ephemeral: true });
            return;
        }

        const sub = interaction.options.getSubcommand();
        const member = await interaction.guild.members.fetch(interaction.user.id);

        if (sub === 'check') {
            const targetUser = interaction.options.getUser('user') || interaction.user;

            if (targetUser.id !== interaction.user.id) {
                const isStaff = member.roles.cache.has(config.staffRole ?? '')
                    || config.adminRoles.some((roleId: string) => member.roles.cache.has(roleId))
                    || member.permissions.has('Administrator');
                if (!isStaff) {
                    await interaction.reply({ content: '❌ You can only check your own cooldown.', ephemeral: true });
                    return;
                }
            }

            const recent = await LOA.findOne({
                userId: targetUser.id,
                guildId: interaction.guildId,
                createdAt: { $gte: new Date(Date.now() - config.cooldownHours * 3600000) }
            }).sort({ createdAt: -1 });

            const embed = new EmbedBuilder()
                .setTitle('⏰ Cooldown Status')
                .addFields([
                    { name: '👤 User', value: `<@${targetUser.id}>`, inline: true },
                    { name: '⏰ Cooldown', value: `${config.cooldownHours} hours`, inline: true }
                ]);

            if (recent) {
                const end = new Date(recent.createdAt.getTime() + config.cooldownHours * 3600000);
                const left = end.getTime() - Date.now();
                embed.setColor(left > 0 ? 0xFEE75C : 0x57F287);
                embed.addFields([
                    { name: '📊 Status', value: left > 0 ? '⏳ On Cooldown' : '✅ Available', inline: true }
                ]);
                if (left > 0) {
                    embed.addFields([
                        { name: '⏱️ Ready', value: `<t:${Math.floor(end.getTime() / 1000)}:R>`, inline: true },
                        { name: '📝 Last Request', value: `#${recent.loaId} (${recent.status})`, inline: true }
                    ]);
                }
            } else {
                embed.setColor(0x57F287);
                embed.addFields([{ name: '📊 Status', value: '✅ Available', inline: true }]);
            }

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        // === clear subcommand ===
        const isAdmin = config.adminRoles.some((roleId: string) => member.roles.cache.has(roleId))
            || member.permissions.has('Administrator');
        if (!isAdmin) {
            await interaction.reply({ content: '❌ Only admins can clear cooldowns.', ephemeral: true });
            return;
        }

        const targetUser = interaction.options.getUser('user', true);
        const recent = await LOA.findOne({
            userId: targetUser.id,
            guildId: interaction.guildId,
            createdAt: { $gte: new Date(Date.now() - config.cooldownHours * 3600000) }
        }).sort({ createdAt: -1 });

        if (!recent) {
            await interaction.reply({ content: `✅ <@${targetUser.id}> is not on cooldown.`, ephemeral: true });
            return;
        }

        if (recent.status === 'approved') {
            await interaction.reply({
                content: `⚠️ Cannot clear cooldown because <@${targetUser.id}> has an **active** LOA (#${recent.loaId}). Cancel that LOA first.`,
                ephemeral: true
            });
            return;
        }

        await LOA.deleteOne({ _id: recent._id });

        const embed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('✅ Cooldown Cleared')
            .setDescription(`Removed LOA **#${recent.loaId}** (${recent.status}) for <@${targetUser.id}>. They can now submit a new request.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};