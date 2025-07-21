import { model, Schema } from "mongoose";

const BannerSliderSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
},
{
    timestamps: true
}
);

const BannerSlider = model('BannerSlider', BannerSliderSchema)

export default BannerSlider;