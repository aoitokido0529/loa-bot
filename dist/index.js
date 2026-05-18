"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./utils/logger"));
dotenv_1.default.config();
const log = new logger_1.default();
class LOABot extends discord_js_1.Client {
    commands = new discord_js_1.Collection();
    cooldowns = new discord_js_1.Collection();
    constructor() {
        super({ intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMembers, discord_js_1.GatewayIntentBits.GuildMessages, discord_js_1.GatewayIntentBits.MessageContent] });
    }
    async init() {
        try {
            await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/discord-loa-bot');
            log.success('MongoDB connected');
            await this.loadCommands();
            log.success('Loaded ' + this.commands.size + ' commands');
            await this.loadEvents();
            log.success('Events loaded');
            await this.login(process.env.DISCORD_TOKEN);
        }
        catch (e) {
            log.error('Startup failed', e);
            process.exit(1);
        }
    }
    async loadCommands() {
        const mods = [
            (await Promise.resolve().then(() => __importStar(require('./commands/setup')))).default,
            (await Promise.resolve().then(() => __importStar(require('./commands/loarequest')))).default,
            (await Promise.resolve().then(() => __importStar(require('./commands/loalist')))).default,
            (await Promise.resolve().then(() => __importStar(require('./commands/loacd')))).default,
            (await Promise.resolve().then(() => __importStar(require('./commands/loa/approve')))).default,
            (await Promise.resolve().then(() => __importStar(require('./commands/loa/deny')))).default,
            (await Promise.resolve().then(() => __importStar(require('./commands/loa/cancel')))).default,
            (await Promise.resolve().then(() => __importStar(require('./commands/loa/extend')))).default,
            (await Promise.resolve().then(() => __importStar(require('./commands/loa/history')))).default,
            (await Promise.resolve().then(() => __importStar(require('./commands/loa/config')))).default,
            (await Promise.resolve().then(() => __importStar(require('./commands/loawl')))).default
        ];
        for (const m of mods) {
            if (m?.data)
                this.commands.set(m.data.name, m);
        }
    }
    async loadEvents() {
        const ready = (await Promise.resolve().then(() => __importStar(require('./events/ready')))).default;
        const interaction = (await Promise.resolve().then(() => __importStar(require('./events/interactionCreate')))).default;
        if (ready)
            this.once(ready.name, () => ready.execute(this));
        if (interaction)
            this.on(interaction.name, (i) => interaction.execute(i, this));
    }
}
process.on('unhandledRejection', e => log.error('Unhandled rejection', e));
process.on('uncaughtException', e => { log.error('Uncaught exception', e); process.exit(1); });
new LOABot().init();
//# sourceMappingURL=index.js.map