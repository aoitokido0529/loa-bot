import mongoose, { Schema, Document } from 'mongoose';

export interface IGuildConfig extends Document {
    guildId: string;
    logChannel?: string;
    staffRole?: string;
    adminRoles: string[];
    loaRole?: string;
    departments: string[];
    loaTypes: string[];
    maxLoaDuration: number;
    cooldownHours: number;
    allowStaffOverride: boolean;
    notifications: boolean;
    autoExpire: boolean;
    whitelistRoles: string[];
    createdAt: Date;
    updatedAt: Date;
}

const GuildConfigSchema = new Schema<IGuildConfig>({
    guildId: { type: String, required: true, unique: true },
    logChannel: String,
    staffRole: String,
    adminRoles: { type: [String], default: [] },
    loaRole: String,
    departments: { type: [String], default: ['General','Medical','Personal','Training','Other'] },
    loaTypes: { type: [String], default: ['Full LOA','Partial LOA','Semi LOA','Extended Break'] },
    maxLoaDuration: { type: Number, default: 30, min: 1, max: 365 },
    cooldownHours: { type: Number, default: 24, min: 0, max: 720 },
    allowStaffOverride: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
    autoExpire: { type: Boolean, default: true },
    whitelistRoles: { type: [String], default: [] }
}, { timestamps: true });

export const GuildConfig = mongoose.model<IGuildConfig>('GuildConfig', GuildConfigSchema);
export default GuildConfig;