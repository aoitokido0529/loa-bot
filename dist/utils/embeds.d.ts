import { EmbedBuilder, ColorResolvable } from 'discord.js';
export declare class Embeds {
    static Colors: {
        SUCCESS: ColorResolvable;
        ERROR: ColorResolvable;
        WARNING: ColorResolvable;
        INFO: ColorResolvable;
        GOLD: ColorResolvable;
    };
    static build(o: {
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
    static ok(t: string, d?: string): EmbedBuilder;
    static err(t: string, d?: string): EmbedBuilder;
    static warn(t: string, d?: string): EmbedBuilder;
    static info(t: string, d?: string): EmbedBuilder;
}
export default Embeds;
