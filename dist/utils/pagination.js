"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pagination = void 0;
const discord_js_1 = require("discord.js");
class Pagination {
    pages;
    timeout;
    currentPage = 0;
    constructor(pages, timeout = 300000) {
        this.pages = pages;
        this.timeout = timeout;
    }
    async start(interaction) {
        if (!this.pages.length)
            return;
        if (this.pages.length === 1) {
            await interaction.reply({ embeds: this.pages[0].embeds, components: this.pages[0].components || [] });
            return;
        }
        const getRow = () => new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder().setCustomId('prev').setEmoji('◀️').setStyle(discord_js_1.ButtonStyle.Secondary).setDisabled(this.currentPage === 0), new discord_js_1.ButtonBuilder().setCustomId('page').setLabel('Page ' + (this.currentPage + 1) + '/' + this.pages.length).setStyle(discord_js_1.ButtonStyle.Secondary).setDisabled(true), new discord_js_1.ButtonBuilder().setCustomId('next').setEmoji('▶️').setStyle(discord_js_1.ButtonStyle.Secondary).setDisabled(this.currentPage === this.pages.length - 1));
        const msg = await interaction.reply({
            embeds: this.pages[this.currentPage].embeds,
            components: [...(this.pages[this.currentPage].components || []), getRow()],
            fetchReply: true
        });
        const collector = msg.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.Button, time: this.timeout });
        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id)
                return i.reply({ content: '❌', ephemeral: true });
            if (i.customId === 'prev')
                this.currentPage--;
            else if (i.customId === 'next')
                this.currentPage++;
            await i.update({ embeds: this.pages[this.currentPage].embeds, components: [...(this.pages[this.currentPage].components || []), getRow()] });
        });
        collector.on('end', async () => {
            const d = new discord_js_1.ActionRowBuilder()
                .addComponents(new discord_js_1.ButtonBuilder().setCustomId('x').setEmoji('◀️').setStyle(discord_js_1.ButtonStyle.Secondary).setDisabled(true), new discord_js_1.ButtonBuilder().setCustomId('y').setLabel('Expired').setStyle(discord_js_1.ButtonStyle.Secondary).setDisabled(true), new discord_js_1.ButtonBuilder().setCustomId('z').setEmoji('▶️').setStyle(discord_js_1.ButtonStyle.Secondary).setDisabled(true));
            await msg.edit({ components: [...(this.pages[this.currentPage].components || []), d] }).catch(() => { });
        });
    }
}
exports.Pagination = Pagination;
exports.default = Pagination;
//# sourceMappingURL=pagination.js.map