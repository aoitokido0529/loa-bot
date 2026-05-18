"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pagination = void 0;
const discord_js_1 = require("discord.js");
class Pagination {
    pages;
    currentPage = 0;
    timeout;
    constructor(pages, timeout = 300000) { this.pages = pages; this.timeout = timeout; }
    async start(interaction) {
        if (!this.pages.length)
            return;
        if (this.pages.length === 1) {
            await interaction.reply({ embeds: this.pages[0].embeds, components: this.pages[0].components || [] });
            return;
        }
        const getRow = () => new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('pagination_prev').setEmoji('◀️').setStyle(discord_js_1.ButtonStyle.Primary).setDisabled(this.currentPage === 0), new discord_js_1.ButtonBuilder().setCustomId('pagination_page').setLabel('Page ' + (this.currentPage + 1) + '/' + this.pages.length).setStyle(discord_js_1.ButtonStyle.Secondary).setDisabled(true), new discord_js_1.ButtonBuilder().setCustomId('pagination_next').setEmoji('▶️').setStyle(discord_js_1.ButtonStyle.Primary).setDisabled(this.currentPage === this.pages.length - 1));
        const msg = await interaction.reply({ embeds: this.pages[this.currentPage].embeds, components: [...(this.pages[this.currentPage].components || []), getRow()], fetchReply: true });
        const collector = msg.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.Button, time: this.timeout });
        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id)
                return i.reply({ content: '❌ Not your menu.', ephemeral: true });
            const act = i.customId.split('_')[1];
            if (act === 'prev')
                this.currentPage--;
            else if (act === 'next')
                this.currentPage++;
            await i.update({ embeds: this.pages[this.currentPage].embeds, components: [...(this.pages[this.currentPage].components || []), getRow()] });
        });
        collector.on('end', async () => {
            const disabled = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('p1').setEmoji('◀️').setStyle(discord_js_1.ButtonStyle.Secondary).setDisabled(true), new discord_js_1.ButtonBuilder().setCustomId('p2').setLabel('Expired').setStyle(discord_js_1.ButtonStyle.Secondary).setDisabled(true), new discord_js_1.ButtonBuilder().setCustomId('p3').setEmoji('▶️').setStyle(discord_js_1.ButtonStyle.Secondary).setDisabled(true));
            await msg.edit({ components: [...(this.pages[this.currentPage].components || []), disabled] }).catch(() => { });
        });
    }
}
exports.Pagination = Pagination;
exports.default = Pagination;
//# sourceMappingURL=pagination.js.map