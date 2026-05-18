"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbedUtils = void 0;
const discord_js_1 = require("discord.js");
class EmbedUtils {
    static Colors = { SUCCESS: 0x57F287, ERROR: 0xED4245, WARNING: 0xFEE75C, INFO: 0x5865F2, NEUTRAL: 0x2F3136 };
    static createEmbed(opts) {
        const embed = new discord_js_1.EmbedBuilder();
        if (opts.title)
            embed.setTitle(opts.title);
        if (opts.description)
            embed.setDescription(opts.description);
        if (opts.color)
            embed.setColor(opts.color);
        if (opts.fields)
            embed.addFields(opts.fields);
        if (opts.footer)
            embed.setFooter(opts.footer);
        if (opts.timestamp !== false)
            embed.setTimestamp();
        return embed;
    }
    static success(title, desc) { return this.createEmbed({ title: '✅ ' + title, description: desc, color: this.Colors.SUCCESS }); }
    static error(title, desc) { return this.createEmbed({ title: '❌ ' + title, description: desc, color: this.Colors.ERROR }); }
    static warning(title, desc) { return this.createEmbed({ title: '⚠️ ' + title, description: desc, color: this.Colors.WARNING }); }
    static info(title, desc) { return this.createEmbed({ title: 'ℹ️ ' + title, description: desc, color: this.Colors.INFO }); }
}
exports.EmbedUtils = EmbedUtils;
exports.default = EmbedUtils;
//# sourceMappingURL=embeds.js.map