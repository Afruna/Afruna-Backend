import { CardInterface } from '@interfaces/Card.Interface';
import { Schema, model } from 'mongoose';

const CardSchema = new Schema<CardInterface>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    authorization_code: String,
    bin: String,
    last4: String,
    exp_month: String,
    exp_year: String,
    channel: String,
    card_type: String,
    bank: String,
    country_code: String,
    isDefault: Boolean
  },
  { timestamps: true },
);

const Card = model('Card', CardSchema);

export default Card;
