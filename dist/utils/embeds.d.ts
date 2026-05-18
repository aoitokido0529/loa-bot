import { EmbedBuilder, ColorResolvable } from 'discord.js';
export declare class EmbedUtils {
    static readonly Colors: {
        SUCCESS: number;
        ERROR: number;
        WARNING: number;
        INFO: number;
        NEUTRAL: number;
    };
    static createEmbed(opts: {
        title?: string;
        description?: string;
        color?: ColorResolvable;
        fields?: Array<{
            name: string;
            value: string;
            inline?: boolean;
        }>;
        footer?: {
            text: string;
            iconURL?: string;
        };
        timestamp?: boolean;
    }): EmbedBuilder;
    static success(title: string, desc?: string): EmbedBuilder;
    static error(title: string, desc?: string): EmbedBuilder;
    static warning(title: string, desc?: string): EmbedBuilder;
    static info(title: string, desc?: string): EmbedBuilder;
}
export default EmbedUtils;
