import asyncHandler from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponce.js"


const generateAccessTokenAndRefreshToken = async (userID)=>{
  try {
    const user = await User.findById(userID);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false})

    return {accessToken,refreshToken}

  } catch (error) {
    throw new ApiError(500,"something went worng while generating token")
  }
}

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


const loginUser = asyncHandler( async ( req ,res ) =>{

  const {email, username, password} = req.body

    if (!email || !username) {
      throw new ApiError(400," user name or password is required")
    }

    const user = await User.findOne({
    $or:[{username},{email}]
  })
    if (!user) {
      throw new ApiError(404, "User Not Found! you can Register")
    }

   const isPasswordVaild = await user.isPasswordCorrect(password)

   if (!isPasswordVaild) {
    throw new ApiError(401, "Passwordis incorrect")
  }

     const {accessToken , refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

     const options ={
      httpOnly: true,
      secure: true
     }

     return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
      new ApiResponce(200,{
        user: loggedInUser, accessToken ,refreshToken
      },
      "User LogIn Successfully"
      )
     )


})

const logOutUser = asyncHandler( async (req, res) =>{
     await User.findByIdAndUpdate(
        req.user._id,
        {
          $set:{
            refreshToken: undefined
          }
        },
        {
          new: true
        }
      )

      const options ={
        httpOnly: true,
        secure: true
       }

       return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponce(200,{},"user LogOut Successfully"))
})


export {registerUser,loginUser,logOutUser};