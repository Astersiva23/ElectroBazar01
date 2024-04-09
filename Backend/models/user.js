import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import crypto from "crypto";
//crypto  this is a inbuilt package to generate token

const userSchema = new mongoose.Schema({
    name: 
    {
    type: String,
    required:[true,'please enter the name'], 
    maxLength:[50,"your name cannot exceed 50 characters"],
    },
    email:
    {
        type: String,
        required:[true,"please enter the email"],
        unique: true,
    },
    password:
    {
    type: String,
    required:[true,"please Set the password"], 
    minLength:[6,"your PASSWORD cannot exceed 6 characters"],
    select:false,  //we cannot want to send passwords as responce to user
    },
    avatar:
    {
        public_id :String,
        url:String,
    },
    role:
    {
        type:String,
        default:"user",
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
},
{timestamps:true} //Timestaamps method user create aaguraa time mongoose la Update pannirum Automatica
);
userSchema.pre('save',async function(next) //use function key because we use this key  arrow fun not working
{
if(!this.isModified("password"))
{
next();
}
this.password = await bcrypt.hash(this.password,10)    // its method to encrypt passwrod install bcrypt pakaage 10 means no of times has algorithm works
});

userSchema.methods.getJwtToken=function()
{return  jwt.sign({id:this._id},process.env.JWT_SECRET,{
 expiresIn:process.env.JWT_EXPIRES_TIME
});
};

//compare user password 

userSchema.methods.comparePassword= async function(enteredPassword)
{
   return await bcrypt.compare(enteredPassword,this.password);
};

//generate reset password Token
userSchema.methods.getResetPasswordToken=function()
{
    //generate reset password token 
    const resetToken = crypto.randomBytes(20).toString('hex')
    // hash and set to reset password token fiels

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest("hex");
    //token expire time
    this.resetPasswordToken = Date.now() + 10 * 60 * 1000
    return resetToken;
};

export default mongoose.model("User",userSchema);