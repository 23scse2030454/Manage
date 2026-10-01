const express = require("express");
const router = express.Router();
const Product = require("./productModel"); 
const Sale = require("./saleModel"); // Naya sale model import kiya

// 1. PRODUCTS MANGANE KI API (FIXED WITH MONGODB SYNTAX FOR LOW STOCK)
router.get("/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6; 
    const skip = (page - 1) * limit;

    const { search, showLowStock } = req.query;
    let query = {};

    if (search) {
      query.name = new RegExp(search, "i");
    }

    if (showLowStock === "true") {
      // FIX: MongoDB me direct '{ lt: 6 }' kaam nahi karta, '$lte' chahiye hota hai
      query.quantity = { $lte: 5 }; 
    }

    const products = await Product.find(query)
                                  .sort({ name: 1 })
                                  .skip(skip)
                                  .limit(limit);

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalItems: totalProducts,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. NAYA STOCK JODNE KI API
router.post("/products/add-single", async (req, res) => {
  try {
    const { name, price, quantity } = req.body;

    if (!name || quantity === undefined) {
      return res.status(400).json({ success: false, message: "नाम और मात्रा ज़रूरी हैं।" });
    }

    let product = await Product.findOne({ name: new RegExp("^" + name.trim() + "$", "i") });

    if (product) {
      product.quantity += parseInt(quantity);
      product.price = parseFloat(price) || product.price;
      await product.save();
      res.status(200).json({ success: true, data: product });
    } else {
      const newProduct = new Product({
        name: name.trim(),
        price: parseFloat(price) || 0,
        quantity: parseInt(quantity)
      });
      await newProduct.save();
      res.status(200).json({ success: true, data: newProduct });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. QUICK MINUS (-) SAMAN BIKNE PAR INVENTORY STOCK GHATANE AUR SALES LOG KARNE KI API
router.post("/products/sell", async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "सामान नहीं मिला" });
    }

    // Aaj ki date (YYYY-MM-DD) local time zone ke mutabik nikalne ke liye
    const today = new Date().toISOString().split('T')[0];

    // Naya Sales Record create karein
    const newSale = new Sale({
      productName: product.name,
      productId: product._id,
      price: product.price,
      quantitySold: 1,
      totalAmount: product.price,
      date: today
    });
    await newSale.save();

    // Inventory manage karein
    if (product.quantity <= 1) {
      // Aapke pehle ke logic ke mutabik product completely delete ho jayega agar stock 0 ho rha hai
      await Product.findByIdAndDelete(id); 
      return res.status(200).json({ success: true, message: "स्टॉक खत्म, सामान बिक गया और लिस्ट से हटा दिया गया।" });
    } else {
      product.quantity -= 1;
      await product.save();
      return res.status(200).json({ success: true, data: product, message: "बिकी दर्ज हो गई है!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. NAYA ENDPOINT: DATE-WISE BIKI (SALES) REPORT KHOJNE KE LIYE WITH PAGINATION
// 4. DATE-WISE BIKI (SALES) REPORT KHOJNE KE LIYE WITH TOTAL DAY AMOUNT
router.get("/sales/report", async (req, res) => {
  try {
    const { date } = req.query; 
    if (!date) {
      return res.status(400).json({ success: false, message: "कृपया तारीख (Date) चुनें।" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 15; 
    const skip = (page - 1) * limit;

    // 1. Is date ki saari sales nikalen (paginated)
    const sales = await Sale.find({ date: date })
                            .sort({ createdAt: -1 })
                            .skip(skip)
                            .limit(limit);

    const totalSales = await Sale.countDocuments({ date: date });

    // 2. AUTOMATIC TOTAL: Is date ka poora final total amount nikalne ke liye aggregate query
    const totalDayCalculation = await Sale.aggregate([
      { $match: { date: date } },
      { $group: { _id: null, grandTotal: { $sum: "$totalAmount" } } }
    ]);

    // Agar koi biki nahi hui toh grandTotal 0 hoga
    const finalDayTotal = totalDayCalculation.length > 0 ? totalDayCalculation[0].grandTotal : 0;

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalSales / limit),
      totalItems: totalSales,
      fullDayTotal: finalDayTotal, // Yeh poore din ka final total hai
      data: sales
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;