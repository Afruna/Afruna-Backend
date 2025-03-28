import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import User from '@models/User';
import AuthSession from '@models/AuthSession';
import AuthService from '@services/auth.service';
import UserService from '@services/user.service';
import { UserInterface } from '@interfaces/User.Interface';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_API_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_API_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_API_REDIRECT,
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        console.log("Profile", profile)
        let userService = new UserService();
        let user: any = await userService.findOne({ email: profile.emails?.[0]?.value });
        if (user) {
          user.email = profile.emails?.[0]?.value;
          user.firstName = profile.name?.givenName;
          user.lastName = profile.name?.familyName;
          user.avatar = profile._json.picture;
          user.fromOauth = true;

          user = await userService.update(user._id, user);
        }
        else
        {
          user = {
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            avatar: profile._json.picture,
            fromOauth: true
          }
          user = await userService.create(user);
          
          
        }

        

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    },
  ),
);

// passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
//   done(null, user._id.toString());
// });

// passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
//   try {
//     const user = await User.findById(id);
//     console.log("UserId", id)
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

// Passport session setup
passport.serializeUser((user, done) => {
  console.log("UserId", user)
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

export const passportConfig = passport;

export default passport;
