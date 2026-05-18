import mongoose, { Document } from 'mongoose';
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
export declare const GuildConfig: mongoose.Model<IGuildConfig, {}, {}, {}, mongoose.Document<unknown, {}, IGuildConfig, {}, {}> & IGuildConfig & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default GuildConfig;
