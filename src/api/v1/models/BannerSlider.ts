import { model, Schema } from 'mongoose';
import {
  BannerSliderInterface,
  BannerSliderStatus,
  BannerSliderType,
} from '@interfaces/BannerSlider.Interface';

const BannerSliderSchema = new Schema<BannerSliderInterface>(
  {
    title: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    link: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: Object.values(BannerSliderType),
      default: BannerSliderType.CAROUSEL,
    },
    status: {
      type: String,
      enum: Object.values(BannerSliderStatus),
      default: BannerSliderStatus.ACTIVE,
    },
    priority: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const BannerSlider = model('BannerSlider', BannerSliderSchema);

export default BannerSlider;