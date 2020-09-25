const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

function initialize (passport, User){
    async function authenticateUser(username, password, done){
        try{
            let user = await User.findOne({email: username}).exec();
            if(user.password === password){
                return done(null, user);
            }
            else{
                return done(null, false);
            }
        }
        catch(err){
            return done(err);
        }
    }

    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser));

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
    });
}

module.exports = {initialize};