const express = require('express');
const authMiddleware = require('../Middlewares/auth.middleware');
const chatController = require('../controllers/chat.controller');


const router = express.Router();


router.post('/', authMiddleware.authUser, chatController.createChat);
router.get('/', authMiddleware.authUser, chatController.getChats);
router.get('/messages/:chatId', authMiddleware.authUser, chatController.getMessages);
router.delete('/messages/:chatId', authMiddleware.authUser, chatController.deleteChat);




module.exports = router;
