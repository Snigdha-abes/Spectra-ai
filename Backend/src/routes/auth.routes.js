const express=require("express")
const router=express.Router()
const authControllers=require("../controllers/auth.controller")
router.post('/register',authControllers.registerUser)
router.post('/login',authControllers.loginUser)
router.get('/me', authControllers.getCurrentUser);
router.post('/logout', authControllers.logoutUser);
module.exports=router