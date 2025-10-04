const express=require("express")
const router=express.Router()
const authMiddleware=require('../Middlewares/auth.middleware')
const chatController=require('../controllers/chat.controller')
/* POST /api/chat/ */
router.post('/', authMiddleware.authUser, chatController.createChat);
module.exports=router