import mongoose from 'mongoose';
import products from './data.js';
import product from "../models/product.js";
const seedProducts = async () =>
{
    try{

        await mongoose.connect("mongodb://127.0.0.1:27017/ElectroBAZAR")
        await product.deleteMany();
        console.log('products are deleted');

        await product.insertMany(products)
        console.log('products are Inserted');
        process.exit();

    }catch(error)
    {
        console.log(error.message);
        process.exit();
    }
};

seedProducts();