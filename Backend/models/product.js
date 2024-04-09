 import mongoose from "mongoose";    // here we  create our product schema Guys 

 const productSchema = new mongoose.Schema({      //Oru data base la enna maari anth Structure erukanum nu vaikirom
  name:{
    type: String,
    required: [true ,'Please enter the product name'],
    maxLength:[200, 'Product name cannot exceed 200 characters']
  },
  price:
  {
    type:Number,
    required: [true ,'Please enter product name'],
    maxLength:[6 ,"Product price cannot exceed 6 characters"]
  },
  Description:{
    type: String,
    required: [true ,'Please enter the  description of the product']
  },
  ratings:{
    type:Number,
    default:0
  },
  images:[
    {
     public_id :
     {
        type:String,
        required:true
     },
     url:
     {
        type:String,
        required:true,
     },
    },
  ],
  category:
  {
    type: String,
    required: [true ,'Please enter the category of the product'],
    enum : //enum is like a Drop down maari like intha values illana error pass pannum Guys
    {
        values :[
            "Homeneeeds",
            "Electronics",
            "MobilePhones",
            "MobileAcccesories",
            "Furniture",
            "WallClocks",
                 ],
        message : 'Please Select the Correct category of the product',
    },
  },
  Seller:{
    type: String,
    required: [true ,'Please enter the Seller of the Product'],
  },
  stock:
  {
    type:Number,
    required:[true,'please enter the number of Stocks of this Product'],
  },
  numofReviews:
  {
    type:Number,
    default:0,
  },
  reviews:[
  {
    user:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    rating:
    {
        type:Number,
        required:true,
    },
    comment:
    {
        type:String,
        required:true,
    },
  },],
  user:
  {
    type:mongoose.Schema.Types.ObjectId,
    ref:'user',
    required:true,
  },

 },{timestamps:true}
 ); 

 export default mongoose.model("product",productSchema);  