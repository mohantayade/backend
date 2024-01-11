import { Router } from "express";
import {logOutUser, loginUser, registerUser,refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory} from "../controllers/user.controller.js";
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
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverimage"),updateUserCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)



export default router