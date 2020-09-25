const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const auth = require('./auth');
const passport = require('passport');
const session = require('express-session');

const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'Fdpyb3EQY782Uu8D8KkGMyqmcqozqR',
    resave: false, 
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost/userDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    messages: []
});
const messageSchema = new mongoose.Schema({
    username: String,
    message: String
});

const User = new mongoose.model('User', userSchema);
const Message = new mongoose.model('Message', userSchema);


auth(passport, User);

app.route('/')
    .get((req, res) => {
        res.render('home')
    });

app.route('/register')
    .get((req, res, next) => {
        res.render('register');
    })
    .post(async (req, res, next) => {
        let newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });

        let result = await newUser.save();
        if(result != null){
            res.redirect('/messages');
        }
        else{
            next(result);
        }
    })

app.route('/login')
    .get((req, res) => {
        res.render('login');
    })
    .post(
        passport.authenticate('local', {
            successRedirect: '/messages',
            failureRedirect: '/login'
        })
    );

app.route('/messages')
    .get(async (req, res) => {
        let messages = []
        try{
            let messages = await Message.find({}).exec();
        }
        catch(err){
            console.error(err);
        }
        res.render('messages', {messages: messages});
    });

app.route('/message')
    .post((req, res) => {

    });


app.listen(process.env.PORT || 3000, () => {
    console.log('** Server turned on. **');
})