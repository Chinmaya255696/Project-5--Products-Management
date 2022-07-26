const express = require("express");
const router=express.Router();
const userController = require("../controller/userController")

router.post("/createUser",userController.createUser)
router.post("/login",userController.loginUser)
router.get("/getUser",userController.getUser)











module.exports=router;