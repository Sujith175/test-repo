const express = require("express")
const {signUp, login, userVerification, getUser, refreshToken, logout} = require('../Controllers/login')
const router = express.Router()

router.route("/signup").post(signUp)
router.route("/login").post(login)
router.route("/verify").get(userVerification, getUser)
router.route("/refreshtoken").get(refreshToken , userVerification, getUser)
router.route("/logout").post(userVerification, logout)

module.exports = router