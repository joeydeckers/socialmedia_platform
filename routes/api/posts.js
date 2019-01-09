const express = require('express');
const router = express.Router();

// @route   GET api/posts/tests
// @desc    tests post route
// @access  public 
router.get('/test', (req, res) => res.json({msg: "Posts Works"}));

module.exports = router;