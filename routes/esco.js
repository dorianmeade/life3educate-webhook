const router = require('express').Router()
const {getJobDescription} = require('../middleware/esco');
const {sendJobDescription} = require('../controllers/esco');


router.route('/').get(getJobDescription, sendJobDescription)

module.exports = router;