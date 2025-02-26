const express = require('express')
const router = express.Router()
const spotifyController = require('../controllers/spotifyController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(spotifyController.getState)
    .post(spotifyController.createState)
    .patch(spotifyController.updateState)

module.exports = router