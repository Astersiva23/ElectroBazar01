///create a token and save in the cookie

export default (user, statusCode, res) =>
{
    //create JWT token 
    const token = user.getJwtToken();

    //option for cookie
    const options ={
        expires : new Date(Date.now()+process.env.COOKIE_EXPIRES_TIME*24*60*60*1000),
        httpOnly:true  // the purpose of http true is only accesed by backend not from frontend
    };
    // console.log(options);
res.status(statusCode).cookie("token", token, options).json({
    token,
});
};