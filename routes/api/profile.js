const express = require('express');
const router = express.Router();

// @route   GET api/profile/tests
// @desc    tests profile route
// @access  public 
router.get('/test', (req, res) => res.json({msg: "Profile Works"}));

module.exports = router;