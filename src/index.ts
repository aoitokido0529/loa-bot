import { Client, GatewayIntentBits, Collection } from 'discord.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Logger from './utils/logger';

dotenv.config();
const log = new Logger();

class LOABot extends Client {
    public commands = new Collection<string, any>();
    public cooldowns = new Collection<string, Collection<string, number>>();

    constructor() {
        super({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
    }

    async init() {
        try {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/discord-loa-bot');
            log.success('MongoDB connected');
            await this.loadCommands();
            log.success('Loaded ' + this.commands.size + ' commands');
            await this.loadEvents();
            log.success('Events loaded');
            await this.login(process.env.DISCORD_TOKEN);
        } catch (e) { log.error('Startup failed', e); process.exit(1); }
    }

    private async loadCommands() {
        const mods = [
            (await import('./commands/setup')).default,
            (await import('./commands/loarequest')).default,
            (await import('./commands/loalist')).default,
            (await import('./commands/loacd')).default,
            (await import('./commands/loa/approve')).default,
            (await import('./commands/loa/deny')).default,
            (await import('./commands/loa/cancel')).default,
            (await import('./commands/loa/extend')).default,
            (await import('./commands/loa/history')).default,
            (await import('./commands/loa/config')).default,
            (await import('./commands/loawl')).default
        ];
        for (const m of mods) { if (m?.data) this.commands.set(m.data.name, m); }
    }

    private async loadEvents() {
        const ready = (await import('./events/ready')).default;
        const interaction = (await import('./events/interactionCreate')).default;
        if (ready) this.once(ready.name as string, () => ready.execute(this));
        if (interaction) this.on(interaction.name as string, (i: any) => interaction.execute(i, this));
    }
}

process.on('unhandledRejection', e => log.error('Unhandled rejection', e));
process.on('uncaughtException', e => { log.error('Uncaught exception', e); process.exit(1); });
new LOABot().init();