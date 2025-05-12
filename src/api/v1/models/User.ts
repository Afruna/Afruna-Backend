/* eslint-disable func-names */
import { model, Schema, Model } from 'mongoose';
// import bcrypt from 'bcrypt';
import { UserInterface, UserRole } from '@interfaces/User.Interface';
import { customIdPlugin } from './IdPlugin';

const userSchema = new Schema<UserInterface>(
  {
    firstName: String,
    lastName: String,
    phoneNumber: String,
    city: String,
    country: String,
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    password: {
      type: String,
      minlength: 8,
      required: false,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    verifiedEmail: { type: Boolean, default: false },
    verificationToken: String,
    avatar: String,
    resetToken: String,
    isVendor: { type: Boolean, default: false },
    isProvider: { type: Boolean, default: false },
    addresses: {
      type: [
        new Schema({
          address: String,
          street: String,
          postCode: String,
          city: String,
          state: String,
          country: String,
        }),
      ],
      default: [],
    },
    online: Boolean,
    socketId: String,
    fromOauth: { type: Boolean, default: false },
    blocked: { type: Boolean, default: false },
    deActivated: { type: Boolean, default: false },
    followers: { type: Schema.Types.Mixed, default: [] },
    following: { type: Schema.Types.Mixed, default: [] },
    isFollowing: { type: Schema.Types.Mixed, default: null },
    isFollower: { type: Schema.Types.Mixed, default: null },
    visits: Number,
    ratings: Number,
    ratedBy: Number,
    bookings: { type: Number, default: 0 },
    booked: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.fullName = `${ret.firstName} ${ret.lastName}`;
        ret.followers = ret.followers.length;
        ret.following = ret.following.length;
      },
    },
  },
);

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) next();

//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);

//   next();
// });

// userSchema.methods.comparePasswords = async function (password: string) {
//   // eslint-disable-next-line no-return-await
//   return await bcrypt.compare(password, this.password);
// };

// userSchema.methods.getSignedToken = function () {
//   // eslint-disable-next-line no-underscore-dangle
//   return jwt.sign({ id: this._id }, JWT_KEY, { expiresIn: JWT_TIMEOUT });
// };

// userSchema.methods.toJSON = function() {
//   const user = this;
//   return omit(user.toObject(), ['password']);
// };

// userSchema.methods.transform = function() {
//   const user = this;
//   return pick(user.toJSON(), ['id', 'email', 'name', 'age', 'role']);
// };

userSchema.pre(/^find/, function (this: any, next) {
  this.sort({ createdAt: -1 });
  next();
});

userSchema.plugin(customIdPlugin, { modelName: 'User' });

export default <Model<UserInterface>>model('User', userSchema);
