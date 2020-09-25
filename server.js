require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const auth = require('./auth');
const passport = require('passport');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    messages: [],
    googleId: String,
    facebookId: String
});
const messageSchema = new mongoose.Schema({
    username: String,
    message: String,
    date: {type: Date, default: Date.now}
});

const User = new mongoose.model('User', userSchema);
const Message = new mongoose.model('Message', messageSchema);

auth.initialize(passport, User);

function ensureAuthenticated(req, res, next){
    if(!req.isAuthenticated()){
        res.redirect('/login');
    }
    else{
        next();
    }
}

function ensureNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        res.redirect('/messages');
    }
    else{
        next();
    }
}

app.route('/')
    .get((req, res) => {
        res.render('home')
    });

app.route('/register')
    .get(ensureNotAuthenticated, (req, res, next) => {
        res.render('register');
    })
    .post(ensureNotAuthenticated, async (req, res, next) => {
        let hash = await bcrypt.hash(req.body.password, 10);
        let newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hash
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
    .get(ensureNotAuthenticated, (req, res) => {
        res.render('login');
    })
    .post(ensureNotAuthenticated,
        passport.authenticate('local', {
            successRedirect: '/messages',
            failureRedirect: '/login'
        })
    );

app.route('/auth/google')
    .get(passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

app.route('/auth/google/redirect')
    .get(passport.authenticate('google'), (req, res) => {
        res.redirect('/messages');
    });

app.route('/auth/facebook')
    .get(passport.authenticate('facebook', {
        scope: ['email']
    }));

app.route('/auth/facebook/redirect')
    .get(passport.authenticate('facebook'), (req, res) => {
        res.redirect('/messages');
    })

app.route('/logout')
    .post((req, res) => {
        req.logout();
        res.redirect('/');
    });

app.route('/messages')
    .get(ensureAuthenticated, async (req, res) => {
        let messages = []
        try{
            messages = await Message.find({}).exec();
        }
        catch(err){
            console.error(err);
        }
        res.render('messages', {messages: messages});
    });

app.route('/message')
    .post(async (req, res) => {
        let newMessage = new Message({
            username: req.user.username,
            message: req.body.message
        });
        try{
            await newMessage.save();
            let user = await User.findOne({username: req.user.username});
            user.messages.push(newMessage);
            await user.save();
            res.redirect('messages');
        }
        catch(err){
            console.error(err);
        }
    });


app.listen(process.env.PORT || 3000, () => {
    console.log('** Server turned on. **');
})