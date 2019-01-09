const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load User model

const app = express();

const User = require('../../models/User');

// Passport

app.use(passport.initialize());

// Passport config
require('./../../config/passport.js')(passport);

// @route   GET api/users/Register
// @desc    Register users route
// @access  public

router.post('/register', (req, res) => {
    User.findOne({email: req.body.email})
        .then(user => {
            if(user){
                return res.status(400).json({email: 'Email exists'});
            }else{

                const avatar = gravatar.url(req.body.email,{
                    s: '200',
                    r: 'pg',
                    d: 'mm'
                });

                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password 
                });

                bcrypt.genSalt(10, (err,salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                })

            }
        })
});

// @route   GET api/users/login
// @desc    login user / return token
// @access  public

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // find user by email
    User.findOne({email})
        .then(user => {
            // check for user
            if(!user){
                return res.status(404).json({email: 'user not found'});
            }
            // check password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch){
                        // user matched
                        const payload = { id: user.id, name: user.name, avatar: user.avatar } //create jwt payload
                        jwt.sign(payload, keys.secretOrKey, {expiresIn: 3600}, (err, token) => {
                            res.json({
                                success: true,
                                token:'Bearer ' + token
                            });
                        });
                        // sign token
                    }else{
                        return res.status(400).json({password: 'Password incorrect'});
                    }
                }) 
        });
});

// @route   GET api/users/current
// @desc    current users route
// @access  private

router.get('/current', passport.authenticate('jwt', {session:false}), (req, res) => {
    res.json({
        id:req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});



module.exports = router;