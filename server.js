const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

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

let messages = [
    {name: 'Jonathon Brandt', content: 'Hello everybody!'},
    {name: 'Josh Rodgers', content: 'Hey there!'}
];

app.route('/')
    .get((req, res) => {
        res.render('home')
    });

app.route('/register')
    .get((req, res, next) => {
        res.render('register');
    })
    .post((req, res, next) => {
        let newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });

        newUser.save((err) => {
            if(err){
                next(err);
            }
            else{
                res.redirect('/messages');
            }
        });
    })

app.route('/login')
    .get((req, res) => {
        res.render('login');
    })
    .post((req, res, next) => {
        User.findOne({email: req.body.email}, (err, user) => {
            if(err){
                next(err);
            }
            else{
                if(user){
                    if(req.body.password === user.password){
                        res.redirect('/messages');
                    }
                    else{
                        res.redirect('/login');
                    }
                }
                else{
                    res.redirect('/login');
                }
            }
        });
    });

app.route('/messages')
    .get((req, res) => {
        res.render('messages', {messages: messages});
    });

app.route('/message')
    .post((req, res) => {

    });


app.listen(process.env.PORT || 3000, () => {
    console.log('** Server turned on. **');
})