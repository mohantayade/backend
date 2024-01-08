import asyncHandler from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponce.js"


const registerUser = asyncHandler( async (req, res)=>{
      
      const {fullname,username,email,password} = req.body
      console.log("eamil :", email);

      if([fullname,username,email,password].some((field)=>field?.trim() === "")){
        throw new ApiError(200, "FullName Is required")
      }

       const existedUser = await User.findOne({
        $or : [{username},{email}]
      })

      if (existedUser) {
        throw new ApiError(409, "User All Ready Exist")
      }
      
      const avatarLocalPath = req.files?.avatar[0]?.path;
      // const coverimageLocalPath = req.files?.coverimage[0]?.path;

      let coverimageLocalPath;
      if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0){
        coverimageLocalPath = req.files.coverimage[0].path
      }

      if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required")
      }

      const avatar = await uploadOnCloudinary(avatarLocalPath)
      const coverimage = await uploadOnCloudinary(coverimageLocalPath)
      if (!avatar) {
        throw new ApiError(400,"Avatar file is required")
      }

      const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverimage: coverimage?.url || "",

      })

      const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
      )

      if (!createdUser) {
        throw new ApiError(500,"something went worng while registering the user")
      }

      return res.status(201).json(
        new ApiResponce(200, createdUser,"User Register Successfully")
      )
})


export default registerUser;