import catchAysncErrors from "../middlewares/catchAysncErrors.js";
import User from  '../models/user.js';
import { getResetPasswordTemplate } from "../utils/emailTemplate.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/sendToken.js";
import sendemail from "../utils/sendemail.js";
import crypto from "crypto";
import {delete_file, upload_file} from "../utils/cloudinary.js";

// regiter user => /api/v1/register
export const registerUser = catchAysncErrors (async(req,res,next) =>
{
   const {name,email,password}=req.body;
    const user = await User.create(
        {
            name,
            email,
            password,
        }
    );

  sendToken(user,201,res);  // const token = user.getJwtToken();     // use token funct here

    // res.status(201).json(
    //     {
    //         token,    // we send the token as response
    //     }
    // );

});


export const loginUser = catchAysncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return next(new ErrorHandler('Please enter email and password', 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
      return next(new ErrorHandler('Invalid email or password', 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
      return next(new ErrorHandler('Invalid email or password', 401));
  }

  // Password is correct, send token
  sendToken(user, 200, res);
});


// login user => /api/v1/login
// export const loginUser = catchAysncErrors (async(req,res,next) =>
// {
//    const {email,password}=req.body;
    
//    if(!email || !password)
//    {
//     return next(new ErrorHandler('Please enter email & Passwrod',400))
//    }
//    const user = await User.findOne({email}).select("+password")
//    if(!user)
//    {
//     return next(new ErrorHandler('Invalid email or Passwrod',401))
//    }

//    //check if password is correct 

//    const isPasswordMatched =  await user.comparePassword(password)

//     // const token = user.getJwtToken();     // use token funct here

//   sendToken(user,200,res);  // res.status(201).json(
//     //     {
//     //         token,    // we send the token as response
//     //     }
//     // );

// });

// logout user => /api/v1/logout
export const logoutUser = catchAysncErrors (async(req,res,next) =>
{
  res.cookie("token",null, {
    expires: new Date(Date.now()),
    httpOnly: true
  });
  res.status(200).json({
    message:"Logged Out",
  });
});

//api/v1/me/upload_avatar
export const uploadAvatar = catchAysncErrors (async(req,res,next) =>
{
  
  const avatarResponse = await upload_file(req.body.avatar,"electroBazar/avatars")
  
  if(req?.user?.avatar?.url)
  {
await delete_file(req?.user?.avatar?.public_id);
  }

  const user =  await User.findByIdAndUpdate(req?.user?._id,{avatar:avatarResponse,});

  res.status(200).json({
    user,
  });
});


//forgotPassword => /api/v1/password/forgot 
export const forgotPassword = catchAysncErrors (async(req,res,next) =>
{
   const user = await User.findOne({email:req.body.email});
   if(!user)
   {
    return next(new ErrorHandler('User Not found with this email',404))
   }

   //Get reset password token

   const resetToken =  user.getResetPasswordToken()

   await user.save()

   const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

   const message = getResetPasswordTemplate(user?.name,resetUrl);

   try
   {
    await sendemail({
      email:user.email,
      subject:"ElectroBazar Password recovered",
      message,
    });

    res.status(200).json({
      message : `email sent to :${user.email}`
    });

   }catch(error)
   {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return next(new ErrorHandler(error?.message,500));

   }

    // const token = user.getJwtToken();     // use token funct here
  // res.status(201).json(
    //     {
    //         token,    // we send the token as response
    //     }
});

export const resetPassword = catchAysncErrors(async(req,res,next) =>
{
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest("hex");


const user = await User.findOne({

  resetPasswordToken,
  resetPasswordExpire:{$gt:Date.now()},
});

if(!user)
   {
    return next(new ErrorHandler('Password reset token is invalid or has been expired',400))
   }

   if(req.body.password !== req.body.confirmPassword){
   return next(new ErrorHandler('Password does not match',400))
   }
user.password = req.body.password;
user.resetPasswordToken = undefined;
user.resetPasswordExpire = undefined;
await user.save()

sendToken(user,200,res);

 });

 //get current user => /api/v1/me

 export const getUserProfile = catchAysncErrors(async (req, res, next)=>
 {
  const user = await User.findById(req?.user?._id);
  res.status(200).json({
    user,
  });

 });

 //=>/api/v1/password/update

 export const updatePassword = catchAysncErrors(async (req, res, next)=>
 {
  const user = await User.findById(req?.user?._id).select("+password");
  //check the previous user password

  const isPasswordMatched =  await user.comparePassword(req.body.oldPassword);

  if(!isPasswordMatched) {
    return next(new ErrorHandler("old Password is incorrect",400));
  }

  user.password =  req.body.password;
  user.save()

  res.status(200).json({
    success:true,
  });

 });


 
 export const updateProfile = catchAysncErrors(async (req, res, next)=>
 {
   const newUserData =
   {
    name:req.body.name,
    email:req.body.email,
   }

const user = await User.findByIdAndUpdate(req.user._id,newUserData,
  {
    new:true,
  })

  res.status(200).json({
    user,
  });

 });

//=>ap/v1/admin/users
 export const allUsers = catchAysncErrors(async (req, res, next)=>
 {
   const users = await User.find();

   res.status(200).json({
    users,
   });

 });

 // =>/api/v1/admin/users/:id
 export const getUserDetail = catchAysncErrors(async(req,res,next)=>
 {
  const user = await User.findById(req.params.id);
  if(!user)
  {return next(
    new ErrorHandler(`user not found with id : ${req.params.id}`,400)
  );

  }
  res.status(200).json({
    user,
  })

 });

 //update user details => /api/v1/admin/users/:id
 export const updateUser = catchAysncErrors(async (req, res, next)=>
 {
   const newUserData =
   {
    name:req.body.name,
    email:req.body.email,
    role:req.body.role,
   }

const user = await User.findByIdAndUpdate(req.user._id,newUserData,
  {
    new:true,
  })

  res.status(200).json({
    user,
  });

 });
//=>api/v1/admin/users/:id
 export const deleteUser = catchAysncErrors(async(req,res,next)=>
 {
  const user = await User.findById(req.params.id);
  if(!user)
  {return next(
    new ErrorHandler(`user not found with id : ${req.params.id}`,400)
  );}
  await user.deleteOne();
  res.status(200).json({
    success: true,
  })

 });




