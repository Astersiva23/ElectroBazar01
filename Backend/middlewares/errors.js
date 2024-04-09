import ErrorHandler from "../utils/errorHandler.js";
export default (err,req,res,next)=>
{
    let error =
    {
        statusCode: err?.statusCode || 500,
        message: err?.message || "Internal Server Error",
    };

//Handle Invalid Monoogose ID Error

if(err.name==="CastError")
{
    const message =`Resource Not found.Invalid:${err?.path}`
    error = new ErrorHandler(message,404)
}

if(err.name==="ValidationError")
{
    const message =Object.values(err.errors).map((value)=>value.message)
    error = new ErrorHandler(message,400)
}

if(err.code  === "1100")
{
    const message =`Duplicate:${Object.keys(err?.keyValue)}entered.`;
    error = new ErrorHandler(message,400)
}

if(err.name==="JsonWebTokenError")
{
    const message =`JsonwebToken is invalid  try again`;
    error = new ErrorHandler(message,400)
}

if(err.name==="TokenExpiredError")
{
    const message =`Json Web Token is expired`;
    error = new ErrorHandler(message,400)
}



    if(process.env.NODE_ENV === "DEVELOPEMENT"){res.status(error.statusCode).json(
        {
            message:error.message,
            error:error,
            stack:err?.stack,
        }
    );}
    res.status(error.statusCode).json(
        {
            message:error.message,
        }
    );

if(process.env.NODE_ENV === "PRODUCTION"){res.status(error.statusCode).json(
    {
        message:error.message,
    }
);}
res.status(error.statusCode).json(
    {
        message:error.message,
    }
);

};