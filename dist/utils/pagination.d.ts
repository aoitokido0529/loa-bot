import { ActionRowBuilder, EmbedBuilder } from 'discord.js';
interface Page {
    embeds: EmbedBuilder[];
    components?: ActionRowBuilder<any>[];
}
export declare class Pagination {
    private pages;
    private timeout;
    private currentPage;
    constructor(pages: Page[], timeout?: number);
    start(interaction: any): Promise<void>;
}
export default Pagination;
