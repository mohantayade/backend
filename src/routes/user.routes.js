import { Router } from "express";
import {logOutUser, loginUser, registerUser,refreshAccessToken} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.js"
import { verifyJWT } from "../middlewares/auth.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name : "coverimage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)

// secured route
router.route("/logout").post(verifyJWT, logOutUser)
router.route("refresh-token").post(refreshAccessToken)
export default router