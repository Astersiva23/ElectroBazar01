import express from 'express'; // this is our entry file to the server
const app = express();
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import { connectDatabase } from './config/dbConnect.js';
import errorMiddleware from './middlewares/errors.js';

//handle uncaught exceptions


process.on('uncaughtException', (err)=>
{
    console.log(`ERROR ${err}`);
    console.log("shutting due to uncaught excption");
    process.exit(1);
});

dotenv.config({path:'Backend/config/config.env'});

//connecting to Database
connectDatabase();

app.use(express.json({limit:"10mb",
verify:(req,res,buf)=>{
    req.rawbody = buf.toString();
}
})); 
// engatha ella routes file import pandrom C:\MERN\Backend\routes\products.js
app.use(cookieParser());

import productRoutes from './routes/products.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';

app.use("/api/v1", productRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", paymentRoutes);

// its handle all errors we use this handler
app.use(errorMiddleware);

 const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server listening on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});

//unhandled promise rejection 
process.on("unhandledRejection", (err)=>
{
    console.log(`ERROR :${err}`);
    console.log("Shuttingg down the server due to Unhandled Rejection");
    server.close(()=>{
        process.exit(1);
    });
});