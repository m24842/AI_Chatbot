const express = require('express')
const router = express.Router()
const conversationController = require('../controllers/conversationController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(conversationController.getUserConversations)
    .post(conversationController.createUserConversation)
    .patch(conversationController.updateUserConversation)
    .delete(conversationController.deleteUserConversation)

module.exports = router