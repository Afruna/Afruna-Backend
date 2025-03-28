import { Types } from 'mongoose';

export interface SearchHistoryInterface {
    userId: string | Types.ObjectId;
    name: string;
}