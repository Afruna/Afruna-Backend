import { Schema, model } from 'mongoose';

const counterSchema = new Schema({
  model: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
});

const Counter = model('Counter', counterSchema);

export const customIdPlugin = (schema: Schema, options: { modelName: string }) => {
  const { modelName } = options;

  schema.pre('save', async function (next) {
    const doc = this;

    if (!doc.isNew) {
      return next();
    }

    try {
      const counter = await Counter.findOneAndUpdate(
        { model: modelName },
        { $inc: { count: 1 } },
        { new: true, upsert: true },
      ).exec();

      doc.customId = `#${counter.count}`;

      return next();
    } catch (error: any) {
      return next(error);
    }
  });
};
