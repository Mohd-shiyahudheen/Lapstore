const bcrypt = require('bcrypt');
const vendorModel = require('../model').Vendor;
const productModel = require('../model').Product
const Orders = require('../model').Orders
const multer = require('multer');
const { fileURLToPath } = require('url');
const { Product, Brand } = require('../model');
const nodemailer = require('nodemailer');
const res = require('express/lib/response');
const { resolve } = require('path');






// sreeting multer file upload storage path setting//
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '--' + file.originalname)
  }
})
var upload = multer({
  storage: storage
})

//product add to data base//
const addProduct = (data, firstImage, secondImage) => {
  return new Promise(async (resolve, reject) => {
    let first = firstImage
    let second = secondImage
    const brands = await Brand.findOne({ brandname: data.brandname })
    const addproducts = await new Product({
      productname: data.productname,
      brand: data.brand,
      color: data.color,
      price: data.price,
      oldprice:data.oldprice,
      description:data.description,
      image: { first, second },
      brandname: brands._id
    })
    await addproducts.save().then((response) => {
      console.log(response);
      resolve(response)
    })
  })
}
//get brand// 
const getBrandDetails = () => {
  return new Promise(async (resolve, reject) => {
    let brand = await Brand.find({}).lean()
    resolve(brand)
  })
}

const addBrandName = (brandnamedet) => {
  return new Promise((resolve, reject) => {

    const brandname = new Brand({
      brandname: brandnamedet.brandname
    })
    brandname.save().then((response) => {
      resolve(response)
    })

  })

}

//edit product details//
const updateProduct = (proId, details, firstImage, secondImage) => {
  return new Promise(async (resolve, reject) => {
    let first = firstImage
    let second = secondImage
    Product.updateOne({ _id: proId }, {
      $set: {
        productname: details.productname,
        brand: details.brand,
        color: details.color,
        price: details.price,
        oldprice:details.oldprice,
        description:details.description,
        image: { first, second },
      }
    }).then((response) => {
      resolve()
    })
  })
}
const viewProducts = () => {
  return new Promise((resolve, reject) => {
    Product.find().lean().populate('brandname').then((product_detail) => {
      resolve(product_detail)
      console.log(product_detail);

    })
  })
}

//orders showing page//
const getallOrderDt = () => {
  return new Promise(async (resolve, reject) => {
    let orderDt = await Orders.find({}).populate('productDt').lean()
    resolve(orderDt)
  })
}


//Total orders//
const OrderCount=()=>{
  return new Promise(async(resolve,reject)=>{
    let orderCount = await Orders.find({}).count().lean()
    resolve(orderCount)
  })
}

//Total sales//
const getTotalAmount=()=>{
  return new Promise(async(resolve,reject)=>{
      let OrderTotalAmount=await Orders.aggregate([{
         $group: {
     _id: null,
    "Totalamount": {
       $sum: "$totalAmount"
     }
          }
      }])
      console.log('999999');
      console.log(OrderTotalAmount[0].Totalamount);
     let sum=OrderTotalAmount[0].Totalamount
      resolve(sum)
  })
}
//total Product//
const TotalProduct=()=>{
  return new Promise(async(resolve,reject)=>{
    let totalProduct=await Product.find({}).count().lean()
    resolve(totalProduct)
  })
}



module.exports = {
  upload, //export files//
  addProduct,
  updateProduct,
  getBrandDetails,
  addBrandName,
  viewProducts,
  getallOrderDt,
  getTotalAmount,
  OrderCount,
  TotalProduct,

  //signUp//
  doSignup: (data) => new Promise(async (resolve) => {
    const vendor = new vendorModel(data);
    vendor.role = 'vendor'
    vendor.password = await bcrypt.hash(vendor.password, 10);
    vendor.role = 'vendor';
    try {
      await vendor.save();
      resolve(vendor);
    } catch (err) {
      resolve(err.message);
    }
  }),

  //Login//
  doLogin: (data) => new Promise(async (resolve) => {
    console.log(data);
    const response = {};
    await vendorModel.findOne({ email: data.email }).then(async (vendor) => {
      if (vendor) {
        if (vendor.block == false) {
          const status = await bcrypt.compare(data.password, vendor.password);
          if (status) {
            console.log(status);
            response.status = true
            response.vendor = vendor
            resolve(response);
          } else {
            response.status = false
            resolve(response);
          }

        } else {
          console.log("You are Blocked");
          resolve({ status: false })
        }

      } else {
        response.status = false
        resolve(response);
      }
    });

  }),

  //delete products//
  deleteProduct: (proId) => {
    return new Promise((resolve, reject) => {
      Product.deleteOne({ _id: proId }).then((response) => {
        resolve(response)
      })
    })
  },

  //Edit products//
  getProductDetails: (proId) => {
    return new Promise((resolve, reject) => {
      Product.findOne({ _id: proId }).lean().populate('brandname').then((response) => {
        resolve(response);

      })
    })
  }

};
