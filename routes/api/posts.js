const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Post = require('../../models/Posts');
const Profile = require('../../models/Profile');


const validatePostInput = require('../validation/post');


// @route   GET api/posts/tests
// @desc    tests post route
// @access  public 
router.get('/test', (req, res) => res.json({msg: "Posts Works"}));


// @route   GET api/posts
// @desc    Fetch post
// @access  public
router.get('/', (req, res) => {
    Post.find()
        .sort({ date: -1})
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({ nopostfound: 'No posts found'}));
});

// @route   GET api/posts:id
// @desc    Fetch post by id
// @access  public

router.get('/:id', (req, res) =>{
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({ nopostfound: 'No post found with that id'}));
});

// @route   POST api/posts
// @desc    Create post
// @access  privte 
router.post('/', passport.authenticate('jwt', {session:false}), (req, res) => {
    const { errors, isValid} = validatePostInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }
    
    const newPost = new Post({ 
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.name,
        user: req.user.id
    });

    newPost.save().then(post => res.json(post));
});

// @route   DELETE api/posts
// @desc    Delete post
// @access  privte 
router.delete('/:id', passport.authenticate('jwt', {session:false}), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if(post.user.toString() !== req.user.id){
                        return res.status(401).json({ notauthorized: 'User not authorized'});
                    }

                    post.remove().then(() => {
                        res.json({ success : true});
                    })
                })
                .catch(err => res.status(404).json({ postnotfound: 'Post not found'}));
        })
});

module.exports = router;