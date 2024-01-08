import asyncHandler from "../utils/asynchandler.js"

const registerUser = asyncHandler( async (req, res)=>{
      res.status(200).json({
        message: "ok Mohan",
    })
})


export default registerUser;