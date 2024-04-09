class ErrorHandler extends Error  // error Hadler class our own class.
{
    constructor(message, statusCode)
    {
        super(message)
        this.statusCode = statusCode;
        ErrorHandler.captureStackTrace(this,this.constructor); // this stack means we can see the entire error message .
    }
}

export default ErrorHandler