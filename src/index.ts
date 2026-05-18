import { Client, GatewayIntentBits, Collection } from 'discord.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Logger from './utils/logger';

// Import all commands
import setupCommand from './commands/setup';
import loarequestCommand from './commands/loarequest';
import loalistCommand from './commands/loalist';
import loacdCommand from './commands/loacd';
import approveCommand from './commands/loa/approve';
import denyCommand from './commands/loa/deny';
import cancelCommand from './commands/loa/cancel';
import extendCommand from './commands/loa/extend';
import historyCommand from './commands/loa/history';
import configCommand from './commands/loa/config';
import loawlCommand from './commands/loawl';

// Import events
import readyEvent from './events/ready';
import interactionEvent from './events/interactionCreate';

dotenv.config();

const logger = new Logger();

class LOABot extends Client {
    public commands: Collection<string, any>;
    public cooldowns: Collection<string, Collection<string, number>>;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });
        this.commands = new Collection();
        this.cooldowns = new Collection();
    }

    async init(): Promise<void> {
        try {
            if (!process.env.DISCORD_TOKEN) {
                logger.error('DISCORD_TOKEN is not set in .env file');
                process.exit(1);
            }

            logger.info('Connecting to MongoDB...');
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/discord-loa-bot');
            logger.success('Connected to MongoDB');

            this.loadCommands();
            logger.success(`Loaded ${this.commands.size} commands`);

            this.loadEvents();
            logger.success('Events loaded');

            await this.login(process.env.DISCORD_TOKEN);
        } catch (error) {
            logger.error('Failed to initialize bot:', error);
            process.exit(1);
        }
    }

    private loadCommands(): void {
        const commandList = [
            setupCommand,
            loarequestCommand,
            loalistCommand,
            loacdCommand,
            approveCommand,
            denyCommand,
            cancelCommand,
            extendCommand,
            historyCommand,
            configCommand,
            loawlCommand
        ];

        for (const cmd of commandList) {
            if (cmd?.data) {
                this.commands.set(cmd.data.name, cmd);
            }
        }
    }

    private loadEvents(): void {
        if (readyEvent) {
            this.once(readyEvent.name as string, () => readyEvent.execute(this));
        }
        if (interactionEvent) {
            this.on(interactionEvent.name as string, (interaction: any) => interactionEvent.execute(interaction, this));
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