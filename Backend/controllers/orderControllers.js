import catchAysncErrors from "../middlewares/catchAysncErrors.js";
import Product from "../models/product.js";
import Order from  '../models/order.js';
import ErrorHandler from "../utils/errorHandler.js";


//create new order => /api/v1/orders/new

export const newOrder =catchAysncErrors(async (req, res, next) => {
    try {
        const {
            orderItems,
            shippingInfo,
            itemsPrice,
            taxAmount,
            shippingAmount,
            totalAmount,
            paymentMethod,
            paymentInfo,
        } = req.body;

        const order = await Order.create({
            orderItems,
            shippingInfo,
            itemsPrice,
            taxAmount,
            shippingAmount,
            totalAmount,
            paymentMethod,
            paymentInfo,
            user: req.user._id,
        });

        res.status(200).json({
            order,
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        // Handle other types of errors
        next(error);
    }
});


//api/v1/me/orders
export const myOrders =catchAysncErrors(async(req,res,next)=>
{

    const order = await Order.find({user: req.user._id});
    res.status(200).json({
    order,
})


});

//api/vi/orders/:id

export const getOrderDetails =catchAysncErrors(async(req,res,next)=>
{

    const order = await Order.findById(req.params.id).populate("user", "name");
    if(!order)
    {
        return next(new ErrorHandler('No order found in this id',404))
}
res.status(200).json({
    order,
})


});

//api/v1/admin/orders
export const allOrders =catchAysncErrors(async(req,res,next)=>
{

    const order = await Order.find();
    res.status(200).json({
    order,
})


});

//api/v1/admin/orders/:id
export const updateOrder = catchAysncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return next(new ErrorHandler("No order found with this id", 404));
    }
    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("This order has already been delivered", 400));
    }

    for (const item of order.orderItems) {
        const product = await Product.findById(item.product.toString()); // Corrected variable name and method call
        if (product) {
            product.stock -= item.Quantity;
            await product.save({ validateBeforeSave: false });
        }
    }

    order.orderStatus = req.body.status;
    order.deliveredAt = Date.now();

    await order.save();

    res.status(200).json({
        success: true
    });
});

//api/v1/admin/orders/:id
export const deleteOrder =catchAysncErrors(async(req,res,next)=>
{

    const order = await Order.findById(req.params.id)
    if(!order)
    {
        return next(new ErrorHandler('No order found in this id',404))
}

await order.deleteOne();

res.status(200).json({
    success:true,
});

});


async function getSalesData(startDate, endDate) {
    const salesData = await Order.aggregate([
      {
        // Stage 1 - Filter results
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        // Stage 2 - Group Data
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          totalSales: { $sum: "$totalAmount" },
          numOrders: { $sum: 1 }, // count the number of orders
        },
      },
    ]);
  
    // Create a Map to store sales data and num of order by data
    const salesMap = new Map();
    let totalSales = 0;
    let totalNumOrders = 0;
  
    salesData.forEach((entry) => {
      const date = entry?._id.date;
      const sales = entry?.totalSales;
      const numOrders = entry?.numOrders;
  
      salesMap.set(date, { sales, numOrders });
      totalSales += sales;
      totalNumOrders += numOrders;
    });
  
    // Generate an array of dates between start & end Date
    const datesBetween = getDatesBetween(startDate, endDate);
  
    // Create final sales data array with 0 for dates without sales
    const finalSalesData = datesBetween.map((date) => ({
      date,
      sales: (salesMap.get(date) || { sales: 0 }).sales,
      numOrders: (salesMap.get(date) || { numOrders: 0 }).numOrders,
    }));
  
    return { salesData: finalSalesData, totalSales, totalNumOrders };
  }
  
  function getDatesBetween(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
  
    while (currentDate <= new Date(endDate)) {
      const formattedDate = currentDate.toISOString().split("T")[0];
      dates.push(formattedDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dates;
  }
  
  // Get Sales Data  =>  /api/v1/admin/get_sales
  export const getSales = catchAysncErrors(async (req, res, next) => {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
  
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);
  
    const { salesData, totalSales, totalNumOrders } = await getSalesData(
      startDate,
      endDate
    );
  
    res.status(200).json({
      totalSales,
      totalNumOrders,
      sales: salesData,
    });
  });
