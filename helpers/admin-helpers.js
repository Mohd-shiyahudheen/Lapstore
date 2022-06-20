const bcrypt = require('bcrypt')
const { response } = require('express')
const { User, Orders,brands } = require('../model')
const adminModel = require('../model').User
const sellerModel = require('../model').Vendor

//user detailes showing function//
const userInfo = () => {
  return new Promise((resolve, reject) => {
    adminModel.find().lean().then((userdata) => {
      resolve(userdata)
    })
  })
}

//Seller Detailes showing admin pannel//
const vendorInfo = () => {
  return new Promise((resolve, reject) => {
    sellerModel.find().lean().then((sellerdata) => {
      resolve(sellerdata)
    })
  })
}
//user block//
const blockUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { $set: { block: true } },
      { upsert: true }
    );
    resolve(user);
  });
}

//Unblock user//
const unBlockUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { $set: { block: false } },
      { upsert: true }
    );
    resolve(user);
  });
}

//vendor block
const blockVendor = (vendorId) => {
  console.log(vendorId);
  return new Promise(async (resolve, reject) => {
    const vendor = await sellerModel.findByIdAndUpdate(
      { _id: vendorId },
      { $set: { block: true } },
      { upsert: true }
    );
    resolve(vendor);
  });
}

//Unblock vendor//
const unBlockVendor = (vendorId) => {
  return new Promise(async (resolve, reject) => {
    const vendor = await sellerModel.findByIdAndUpdate(
      { _id: vendorId },
      { $set: { block: false } },
      { upsert: true }
    );
    resolve(vendor);
  });
}

//order showing admin page//
const getallOrderDt = () => {
  return new Promise(async (resolve, reject) => {
    let orderDt = await Orders.find({ orderCancelled:false}).populate('productDt').lean()
    resolve(orderDt)
  })
}

//order status upadation shipped//
const orderStatusShipped = (orderId) => {
  return new Promise(async (resolve, reject) => {
    let shipped = await Orders.findByIdAndUpdate({ _id: orderId }, { $set: { OrderStatus: 'Shipped' } })
    resolve(shipped)
  })
}
//order status Deliverd//
const orderStatusDeliverd = (orderId) => {
  return new Promise(async (resolve, reject) => {
    let Delivered = await Orders.findByIdAndUpdate({ _id: orderId }, { $set: { OrderStatus: 'Delivered' } })
    resolve(Delivered)
  })
}

//Total users count//
const UserCount=()=>{
  return new Promise(async(resolve,reject)=>{
    let userCount = await User.find({}).count().lean()
    resolve(userCount)
  })
}
//Total Vendors count//
const VendorCount=()=>{
  return new Promise(async(resolve,reject)=>{
    let vendorCount = await sellerModel.find({}).count().lean()
    resolve(vendorCount)
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
     let sum=OrderTotalAmount.length?OrderTotalAmount[0].Totalamount:0
      resolve(sum)
  })
}

//get  cancel orders
const getCancelOrders=()=>{
  return new Promise(async(resolve,reject)=>{
      const cancelOrder=await Orders.find({ orderCancelled:true}).populate('productDt').lean()
      resolve(cancelOrder)
  })
}

//get all brand Detailes//
const getAllBrand=()=>{
  return new Promise(async(resolve,reject)=>{
    const getBrands=await brands.find({}).lean()
    resolve(getBrands)
  })
}
 
//delete brands
const deleteBrand=(brandId)=>{
  return new Promise((resolve,reject)=>{
    console.log(brandId);
      brands.deleteOne({_id:brandId}).then(()=>{
          resolve()
      })
  })
 } 

module.exports = {
  //Export//
  userInfo,
  vendorInfo,
  blockUser,
  unBlockUser,
  blockVendor,
  unBlockVendor,
  getallOrderDt,
  orderStatusShipped,
  orderStatusDeliverd,
  UserCount,
  VendorCount,
  OrderCount,
  getTotalAmount,
  getCancelOrders,
  getAllBrand,
  deleteBrand,

  //login checking//
  doLogin: (data) => new Promise(async (resolve, reject) => {
    const response = {};
    adminModel.findOne({ email: data.email }).then(async (admin) => {
      if (admin.role === 2) {
        const status = await bcrypt.compare(data.password, admin.password);
        if (status) {
          response.status = true
          response.admin = admin
          resolve(response);
        } else {
          response.status = false
          resolve(response);
        }
      } else {
        response.status = false
        resolve(response);
      }
    });
  }),
}