import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import catchAysncErrors from "./catchAysncErrors.js";
import User from "../models/user.js";
//check if user ia Authenticted or not?
export const isAuthentictedUser = catchAysncErrors(async (req, res, next)=>
{
 const {token} = req.cookies;  // we need install cookie parser package to parse our cookie
 if(!token)
 {
    return next(new ErrorHandler("Please Login First",401));
 }
 const decoded = jwt.verify(token, process.env.JWT_SECRET)
 req.user = await User.findById(decoded.id);
// console.log(decoded);
 next();
});


//authorize user Roles Here

export const authorizeRoles = (...roles) =>
{
   return (req, res,next) =>
   {
      if(!roles.includes(req.user.role))
      {
         return next(new ErrorHandler(`Role(${req.user.role}) is not allowed `,403));
      }
next();
   };
};