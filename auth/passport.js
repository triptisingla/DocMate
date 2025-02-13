const passport = require('passport');
const FacebookStrategy = require('passport-facebook');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
const User = require('../models/users');
dotenv.config();

passport.use(new FacebookStrategy({
    clientID: process.env.fbClientId,
    clientSecret: process.env.fbClientSecret,
    callbackURL: "http://localhost:4444/users/auth/facebook/callback"
},
    async function (accessToken, refreshToken, profile, cb) {
        // console.log("Access Token: ", accessToken);
        // console.log("Refresh Token:", refreshToken);
        // console.log("Profile: ", profile);
        let facebookId = profile.id;
        let user = await User.findOne({ facebookId }).exec();
        // console.log(user);
        if (user) {
            // console.log(user);
            return cb(null, user);
        }
        else {
            User.create({
                username: profile.displayName,
                token: accessToken,
                facebookId: profile.id
            }).then((user) => {
                cb(null, user);
            })
                .catch(err => {
                    cb(err, false);
                });
        }
    }
));

passport.use(new GoogleStrategy({
    clientID: process.env.googleClientId,
    clientSecret: process.env.googleClientSecret,
    callbackURL: "http://localhost:4444/users/auth/google/callback"
},
    async function (accessToken, refreshToken, profile, cb) {
        // console.log("Access Toke: ", accessToken);
        // console.log("Refresh Token: ", refreshToken);
        // console.log("Profile: ", profile);
        let googleId = profile.id;
        let user = await User.findOne({ googleId }).exec();
        if (user) {
            // console.log(user);
            return cb(null, user);
        }
        else {
            User.create({
                email: profile.email,
                username: profile.displayName,
                token: accessToken,
                googleId: profile.id
            }).then((user) => {
                cb(null, user);
            })
                .catch(err => {
                    cb(err, false);
                });
        }
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id)
        .then((user) => {
            done(null, user);
        })
        .catch(err => {
            done(err, false);
        });
});

module.exports = passport;