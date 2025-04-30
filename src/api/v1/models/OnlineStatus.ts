import { Schema, model } from 'mongoose';

export interface OnlineStatusInterface extends Document {
    id: string; 
    isOnline: boolean;
    lastSeen?: Date;
}

const schema = new Schema<OnlineStatusInterface>({
    id: String,
    isOnline: Boolean,
    lastSeen: Date,
})

const OnlineStatus = model('OnlineStatus', schema);
export default OnlineStatus;