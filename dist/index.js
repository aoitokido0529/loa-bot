"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./utils/logger"));
// Import all commands
const setup_1 = __importDefault(require("./commands/setup"));
const loarequest_1 = __importDefault(require("./commands/loarequest"));
const loalist_1 = __importDefault(require("./commands/loalist"));
const loacd_1 = __importDefault(require("./commands/loacd"));
const approve_1 = __importDefault(require("./commands/loa/approve"));
const deny_1 = __importDefault(require("./commands/loa/deny"));
const cancel_1 = __importDefault(require("./commands/loa/cancel"));
const extend_1 = __importDefault(require("./commands/loa/extend"));
const history_1 = __importDefault(require("./commands/loa/history"));
const config_1 = __importDefault(require("./commands/loa/config"));
const loawl_1 = __importDefault(require("./commands/loawl"));
// Import events
const ready_1 = __importDefault(require("./events/ready"));
const interactionCreate_1 = __importDefault(require("./events/interactionCreate"));
dotenv_1.default.config();
const logger = new logger_1.default();
class LOABot extends discord_js_1.Client {
    commands;
    cooldowns;
    constructor() {
        super({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMembers,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent
            ]
        });
        this.commands = new discord_js_1.Collection();
        this.cooldowns = new discord_js_1.Collection();
    }
    async init() {
        try {
            if (!process.env.DISCORD_TOKEN) {
                logger.error('DISCORD_TOKEN is not set in .env file');
                process.exit(1);
            }
            logger.info('Connecting to MongoDB...');
            await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/discord-loa-bot');
            logger.success('Connected to MongoDB');
            this.loadCommands();
            logger.success(`Loaded ${this.commands.size} commands`);
            this.loadEvents();
            logger.success('Events loaded');
            await this.login(process.env.DISCORD_TOKEN);
        }
        catch (error) {
            logger.error('Failed to initialize bot:', error);
            process.exit(1);
        }
    }
    loadCommands() {
        const commandList = [
            setup_1.default,
            loarequest_1.default,
            loalist_1.default,
            loacd_1.default,
            approve_1.default,
            deny_1.default,
            cancel_1.default,
            extend_1.default,
            history_1.default,
            config_1.default,
            loawl_1.default
        ];
        for (const cmd of commandList) {
            if (cmd?.data) {
                this.commands.set(cmd.data.name, cmd);
            }
        }
    }
    loadEvents() {
        if (ready_1.default) {
            this.once(ready_1.default.name, () => ready_1.default.execute(this));
        }
        if (interactionCreate_1.default) {
            this.on(interactionCreate_1.default.name, (interaction) => interactionCreate_1.default.execute(interaction, this));
        }
    }
}
process.on('unhandledRejection', (error) => {
    logger.error('Unhandled promise rejection:', error);
});
process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    process.exit(1);
});
const bot = new LOABot();
bot.init();
//# sourceMappingURL=index.js.map