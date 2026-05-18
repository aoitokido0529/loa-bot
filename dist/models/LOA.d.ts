import { Document, Model } from 'mongoose';
export interface ILOA extends Document {
    loaId: string;
    guildId: string;
    userId: string;
    type: string;
    reason: string;
    startDate: Date;
    endDate: Date;
    status: string;
    department: string;
    approvedBy?: string;
    approvedAt?: Date;
    deniedBy?: string;
    deniedAt?: Date;
    cancelledBy?: string;
    cancelledAt?: Date;
    reminderSent: boolean;
    createdAt: Date;
    updatedAt: Date;
}
interface ILOAModel extends Model<ILOA> {
    generateLOAId(): string;
}
export declare const LOA: ILOAModel;
export default LOA;
