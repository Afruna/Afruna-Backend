import { Document } from "mongoose";
import { model, Schema } from "mongoose";

export type TagStatus = 'active' | 'inactive' | 'expired';
export type TagType = 'seasonal' | 'normal';

export interface ITags extends Document {
    title: string;
    description: string;
    leftText: string;
    middleText: string;
    startDate: Date;
    endDate: Date;
    cover: string;
    status?: TagStatus;
    seasonalImages?: string[];
    type?: TagType; // Added type field
}

const TagSchema = new Schema<ITags>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    leftText: { type: String, required: true },
    middleText: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    cover: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'inactive' },
    seasonalImages: { type: [String], required: false },
    type: { type: String, enum: ['seasonal', 'normal'], default: 'normal' }, // Added type field
}, {
    timestamps: true,
})

TagSchema.pre('save', function(next) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const startDate = new Date(this.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(this.endDate);
    endDate.setHours(0, 0, 0, 0);

    // Set status to expired if end date matches current date
    if (endDate.getTime() === currentDate.getTime()) {
        this.status = 'expired';
    }
    // Set status to active if start date matches current date
    else if (startDate.getTime() === currentDate.getTime()) {
        this.status = 'active';
    }

    next();
});


const Tags = model<ITags>('Tags', TagSchema);

export default Tags;