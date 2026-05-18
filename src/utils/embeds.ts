import { EmbedBuilder, ColorResolvable } from 'discord.js';
export class Embeds {
    static Colors = {
        SUCCESS: 0x57F287 as ColorResolvable,
        ERROR: 0xED4245 as ColorResolvable,
        WARNING: 0xFEE75C as ColorResolvable,
        INFO: 0x5865F2 as ColorResolvable,
        GOLD: 0xCFB87C as ColorResolvable,
    };
    static build(o: { title?: string; description?: string; color?: ColorResolvable; fields?: Array<{ name: string; value: string; inline?: boolean }>; footer?: { text: string; iconURL?: string }; timestamp?: boolean }) {
        const e = new EmbedBuilder();
        if (o.title) e.setTitle(o.title);
        if (o.description) e.setDescription(o.description);
        if (o.color) e.setColor(o.color);
        if (o.fields) e.addFields(o.fields);
        if (o.footer) e.setFooter(o.footer);
        if (o.timestamp !== false) e.setTimestamp();
        return e;
    }
    static ok(t: string, d?: string) { return this.build({ title: '✅ ' + t, description: d, color: this.Colors.SUCCESS }); }
    static err(t: string, d?: string) { return this.build({ title: '❌ ' + t, description: d, color: this.Colors.ERROR }); }
    static warn(t: string, d?: string) { return this.build({ title: '⚠️ ' + t, description: d, color: this.Colors.WARNING }); }
    static info(t: string, d?: string) { return this.build({ title: 'ℹ️ ' + t, description: d, color: this.Colors.INFO }); }
}
export default Embeds;