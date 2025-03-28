import { SearchHistoryInterface } from '@interfaces/Search.History.Interface';
import { Schema, model } from 'mongoose';

const SearchHistorySchema = new Schema<SearchHistoryInterface>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    name: String
  },
  { timestamps: true },
);

const SearchHistory = model('SearchHistory', SearchHistorySchema);

export default SearchHistory;
