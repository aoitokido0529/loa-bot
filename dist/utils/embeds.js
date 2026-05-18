"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Embeds = void 0;
const discord_js_1 = require("discord.js");
class Embeds {
    static Colors = {
        SUCCESS: 0x57F287,
        ERROR: 0xED4245,
        WARNING: 0xFEE75C,
        INFO: 0x5865F2,
        GOLD: 0xCFB87C,
    };
    static build(o) {
        const e = new discord_js_1.EmbedBuilder();
        if (o.title)
            e.setTitle(o.title);
        if (o.description)
            e.setDescription(o.description);
        if (o.color)
            e.setColor(o.color);
        if (o.fields)
            e.addFields(o.fields);
        if (o.footer)
            e.setFooter(o.footer);
        if (o.timestamp !== false)
            e.setTimestamp();
        return e;
    }
    static ok(t, d) { return this.build({ title: '✅ ' + t, description: d, color: this.Colors.SUCCESS }); }
    static err(t, d) { return this.build({ title: '❌ ' + t, description: d, color: this.Colors.ERROR }); }
    static warn(t, d) { return this.build({ title: '⚠️ ' + t, description: d, color: this.Colors.WARNING }); }
    static info(t, d) { return this.build({ title: 'ℹ️ ' + t, description: d, color: this.Colors.INFO }); }
}
exports.Embeds = Embeds;
exports.default = Embeds;
//# sourceMappingURL=embeds.js.map