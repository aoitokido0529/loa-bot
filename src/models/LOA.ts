import mongoose, { Schema, Document, Model } from 'mongoose';
export interface ILOA extends Document {
  loaId: string; guildId: string; userId: string; type: string; reason: string;
  startDate: Date; endDate: Date; status: string; department: string;
  approvedBy?: string; approvedAt?: Date; deniedBy?: string; deniedAt?: Date;
  cancelledBy?: string; cancelledAt?: Date; reminderSent: boolean;
  createdAt: Date; updatedAt: Date;
}
interface ILOAModel extends Model<ILOA> { generateLOAId(): string; }
const LOASchema = new Schema<ILOA, ILOAModel>({
  loaId: { type:String, required:true, unique:true, uppercase:true },
  guildId: { type:String, required:true, index:true },
  userId: { type:String, required:true, index:true },
  type: { type:String, required:true },
  reason: { type:String, required:true, maxlength:1000 },
  startDate: { type:Date, required:true },
  endDate: { type:Date, required:true },
  status: { type:String, enum:['pending','approved','denied','cancelled','expired'], default:'pending', index:true },
  department: { type:String, default:'General' },
  approvedBy: String, approvedAt: Date, deniedBy: String, deniedAt: Date,
  cancelledBy: String, cancelledAt: Date,
  reminderSent: { type:Boolean, default:false }
}, { timestamps:true });
LOASchema.index({ guildId:1, status:1 });
LOASchema.index({ guildId:1, userId:1, createdAt:-1 });
LOASchema.index({ endDate:1, status:1 });
LOASchema.statics.generateLOAId = function() { return 'LOA-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).substring(2,6).toUpperCase(); };
LOASchema.pre('save', function(next) { if(this.endDate<=this.startDate) return next(new Error('End date must be after start')); next(); });
export const LOA = mongoose.model<ILOA, ILOAModel>('LOA', LOASchema);
export default LOA;