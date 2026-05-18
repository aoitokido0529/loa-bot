import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType, Message } from 'discord.js';
interface Page { embeds: EmbedBuilder[]; components?: ActionRowBuilder<any>[]; }
export class Pagination {
    private currentPage = 0;
    constructor(private pages: Page[], private timeout = 300000) {}
    async start(interaction: any) {
        if (!this.pages.length) return;
        if (this.pages.length === 1) {
            await interaction.reply({ embeds: this.pages[0].embeds, components: this.pages[0].components || [] });
            return;
        }
        const getRow = () => new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setCustomId('prev').setEmoji('◀️').setStyle(ButtonStyle.Secondary).setDisabled(this.currentPage === 0),
                new ButtonBuilder().setCustomId('page').setLabel('Page ' + (this.currentPage + 1) + '/' + this.pages.length).setStyle(ButtonStyle.Secondary).setDisabled(true),
                new ButtonBuilder().setCustomId('next').setEmoji('▶️').setStyle(ButtonStyle.Secondary).setDisabled(this.currentPage === this.pages.length - 1)
            );
        const msg = await interaction.reply({
            embeds: this.pages[this.currentPage].embeds,
            components: [...(this.pages[this.currentPage].components || []), getRow()],
            fetchReply: true
        }) as Message;
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: this.timeout });
        collector.on('collect', async (i: any) => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: '❌', ephemeral: true });
            if (i.customId === 'prev') this.currentPage--;
            else if (i.customId === 'next') this.currentPage++;
            await i.update({ embeds: this.pages[this.currentPage].embeds, components: [...(this.pages[this.currentPage].components || []), getRow()] });
        });
        collector.on('end', async () => {
            const d = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder().setCustomId('x').setEmoji('◀️').setStyle(ButtonStyle.Secondary).setDisabled(true),
                    new ButtonBuilder().setCustomId('y').setLabel('Expired').setStyle(ButtonStyle.Secondary).setDisabled(true),
                    new ButtonBuilder().setCustomId('z').setEmoji('▶️').setStyle(ButtonStyle.Secondary).setDisabled(true)
                );
            await msg.edit({ components: [...(this.pages[this.currentPage].components || []), d] }).catch(() => {});
        });
    }
}
export default Pagination;