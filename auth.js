const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');

function initialize(passport, User) {

    /*
    Function which will be used to authenticate the user when using the passport local strategy.
    It will search for a username (email) in the database, and if one is found, we will compare their 
    passwords. If they match, then it will return that 'user' object.
    */
    async function authenticateUser(username, password, done) {
        try {
            let user = await User.findOne({ email: username }).exec();
            if (user.password === password) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        }
        catch (err) {
            console.error(err);
            return done(err);
        }
    }

    async function authenticateGoogleUser(accessToken, refreshToken, profile, done) {
        try{
            let user = await User.findOne({'googleId': profile.id});
            if(user){
                // if the user id exists in our database, then we don't need to add it. We can just authenticate the user.
                done(null, user);
            }
            else{
                // if the user id does not exist in the database, then we need to add it before authenticating the user.
                let newUserObj = new User({
                    googleId: profile.id,
                    username: profile.displayName,
                    email: profile.emails[0].value
                });
                let newUser = newUserObj.save();
                done(null, newUser);
            }
        }
        catch (err){
            return done(err);
        }
    }


    // Uses the local passport.js authentication strategy - Which simply uses the 'username' and 'password' fields. 
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));


    // Uses the google passport.js authentication strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/redirect'
    },
        authenticateGoogleUser
    ));



    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id).exec();
            done(null, user);
        }
        catch (err) {
            done(err);
        }
    });
}

module.exports = { initialize };