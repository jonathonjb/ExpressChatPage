const LocalStrategy = require('passport-local').Strategy;

module.exports = (passport, User) => {
    async function authenticateUser(email, password, done){
        console.log('AUTHENTICATING USER');
        try{
            let user = await User.findOne({email: email}).exec();
            console.log('user: ');
            console.log(user);
            console.log('password: ');
            console.log(password);
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
        console.log('serializing user');
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        console.log('deserializing user');
        try{
            const user = await User.findById(id).exec();
            done(null, user);
        }
        catch(err){
            done(err);
        }
    }) 
}