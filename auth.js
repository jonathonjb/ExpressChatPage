const e = require("express");
const passport = require("passport")
const LocalStrategy = require('passport-local');

module.exports = (passport, User) => {
    async function authenticateUser(email, password, done){
        try{
            let user = await User.findOne({email: email}).exec();
            if(user.password === password){
                return done(null, true);
            }
            else{
                return done(null, false);
            }
        }
        catch(err){
            return done(err);
        }
    }

    passport.use(new LocalStrategy(authenticateUser));

    passport.serializeUser((user, done) => {
       done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try{
            const user = await User.findById(id).exec();
            done(null, user);
        }
        catch(err){
            done(err);
        }
    }) 
}