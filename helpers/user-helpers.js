const bcrypt = require('bcrypt');
const { Product, Addcart, Wishlist, Shipping, Orders, Brand } = require('../model');
const userModel = require('../model').User;
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const { log } = require('console');

//Razorpay instance creation//
var instance = new Razorpay({
  key_id: 'rzp_test_wscu2FUCWn41mD',
  key_secret: 'sge3RBNDWPEBxcwimONfDztx',
});

//password bcrypting code//

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10)
    return passwordHash;
  } catch (err) {
    console.log(err.message)
  }
}
/*-----------for otp verification in signup-----------*/

const sendVerifyMail = async (name, email, otpGenerator) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      service: 'gmail',
      port: 587,
      secure: false,
      auth: {
        user: 'lapstore74@gmail.com',
        pass: 'sakuqttxibligzhn'
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    console.log(otpGenerator);
    const mailOptions = {
      from: 'lapstore74@gmail.com',
      to: email,
      subject: 'for email verification',
      text: 'Your otp code is ' + otpGenerator
    }
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error)
      }
      else {
        console.log("mail has been send", info.response)
      }
    })

  }
  catch (error) {
    console.log(error);
  }
}

/*------------verify otp-----------*/

const verifyOTP = async (req, res) => {
  let userOTP = req.body.otp
  let userNewOTP = req.session.OTP
  console.log(userNewOTP + '1111111')
  let userDetails = req.session.userDetails
  console.log(userDetails + "88888888")
  try {
    if (userNewOTP == userOTP) {
      const user = new userModel({
        first_name: userDetails.first_name,
        last_name: userDetails.last_name,
        email: userDetails.email,
        phone: userDetails.phone,
        password: userDetails.password
      })

      const newUser = await user.save();
      console.log(newUser)
      req.session.userLoggedIn = true
      req.session.doLogin = true
      req.session.user = newUser
      req.session.userDetails = null
      req.session.OTP = null
      res.redirect("/")
    } else {
      req.session.ErrOtp = "Invalid OTP !!!"
      res.redirect("/verify-otp")
    }

  }
  catch (error) {
    console.log(error)
  }
}
//  user signup
const doSignup = async (req, res) => {
  try {
    const userPassword = await securePassword((req.body.password));

    const user = await new userModel({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone: req.body.phone,
      password: userPassword,
      active: true
    })
    req.session.userDetails = user

    const otpGenerator = Math.floor(1000 + Math.random() * 9000);
    req.session.OTP = otpGenerator;

    if (user) {
      sendVerifyMail(req.body.name, req.body.email, otpGenerator)
      res.redirect('/verify-otp');

    } else {
      res.redirect('/signup');

    }

  }
  catch (error) {
    console.log(error)
  }
}
//pop up page showing clicking image//
const getproductdetail = (proId) => {
  return new Promise(async (resolve, reject) => {
    let viewuserproduct = await Product.findOne({ _id: proId }).lean()
    resolve(viewuserproduct)
  })
}



// /---------------for reset password send mail------------------/

// const sendPasswordResetMail = async (name, email, tocken) => {
const sendPasswordResetMail = async (name, email, otpGenerator) => {
  try {
    const mailTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: "lapstore74@gmail.com",
        pass: "sakuqttxibligzhn"
      },
      tls: {
        rejectUnauthorized: false
      }

    });

    const mailDetails = {
      from: "lapstore74@gmail.com",
      to: email,
      subject: "Reset Password",
      text: 'Your otp code is ' + otpGenerator
      // text: "just random texts ",
      // html: '<p>Hi ' + name + ' click <a href ="http://localhost:3000/users/reset_password?tocken=' + tocken + '"> here to </a> to reset your password</p>'
    }
    mailTransporter.sendMail(mailDetails, (err, Info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("email has been sent ", Info.response);
      }
    })
  } catch (error) {
    console.log(error.message);
  }
}
// /--------------------forget password-----------/

//error msg forget password

const getUserResetPage = async (req, res) => {

  try {

    res.render("user/enter-email", { mailMsg: req.session.checkMailMsg, Errmsg: req.session.checkMailErr })
    req.session.checkMailMsg = false
    req.session.checkMailErr = false
  } catch (error) {
    console.log(error);
  }
}

const forgetPasswordEmailVerify = async (req, res) => {
  try {
    const email = req.body.email;
    console.log(email + 'checking');
    const userResetData = await userModel.findOne({ email: email })
    console.log(userResetData);
    req.session.userResetid = userResetData._id;
    if (userResetData) {
      // const validRandomString=randomstring.generate();
      // req.session.randomString = validRandomString;

      const otpGenerator = Math.floor(1000 + Math.random() * 9000);
      console.log(otpGenerator)
      req.session.OTP = otpGenerator;
      // sendPasswordResetMail(userResetData.name,userResetData.email,validRandomString); 
      sendPasswordResetMail(userResetData.name, userResetData.email, otpGenerator);
      req.session.checkMailMsg = "Check your Email to reset your password"
      //res.redirect("/forget_password")
      res.redirect('/enter-otp')

    }
    else {
      req.session.checkMailErr = "Invalid Email Id"
      res.redirect("/new-password")
    }
  }
  catch (error) {
    console.log(error.message)
  }
}
///-------------- forget password verify otp-----------/

const forgetPasswordOTP = async (req, res) => {
  let userOTP = req.body.otp
  let userNewOTP = req.session.OTP
  //let userDetails=req.session.userDetails
  // console.log(userDetails)
  try {
    if (userNewOTP == userOTP) {
      req.session.OTP = null
      res.redirect("/new-password")

    } else {
      req.session.ErrOtp = "Invalid OTP !!!"
      res.redirect("/enter-otp")
    }

  }
  catch (error) {
    console.log(error)
  }
}
///------------- update the user password------------/
const updateNewPassword = async (req, res) => {

  try {
    const newPassword = req.body.password
    console.log(newPassword)

    const resetId = req.session.userResetid
    console.log(resetId)
    const newSecurePassword = await securePassword(newPassword);
    const updatedUserData = await userModel.findByIdAndUpdate({ _id: resetId }, { $set: { password: newSecurePassword } })
    console.log(updatedUserData)
    //req.session.randomString = null;
    req.session.userResetid = null;
    req.session.resetSuccessMsg = "Your password updated successfully.."
    res.redirect("/login")


  } catch (error) {
    console.log(error.message);
  }
}

//cart product add
const addToCart = (proId, userId) => {
  return new Promise(async (resolve, reject) => {
    let userdt = await Addcart.findOne({ user: userId })
    let product = await Product.findById({ _id: proId })
    if (userdt) {
      let proExist = userdt.cartItems.findIndex(product => product.products == proId)
      if (proExist != -1) {
        resolve({ error: "Product already in cart" });
      } else {
        await Addcart
          .findOneAndUpdate(
            { user: userId },
            { $push: { cartItems: { products: proId, price: product.price } } }
          )
          .then(async (res) => {
            resolve({ msg: "Added", count: res.cartItems.length + 1 });
          });
      }
    } else {
      const newcart = new Addcart({
        user: userId,
        cartItems: { products: proId, price: product.price },
      });
      await newcart.save((err, result) => {
        if (err) {
          resolve({ error: "cart not created" });
        } else {
          resolve({ msg: "cart created", count: 1 });
        }
      });
    }
  });
}


//Quandity increment and decrement in Cart view//
const changeProductQuandity = (details) => {
  let count = parseInt(details.count)
  let quandity = parseInt(details.quandity)
  return new Promise((resolve, reject) => {
    if (count == -1 && quandity == 1) {

      Addcart.updateOne({ 'cartItems._id': details.cart },
        {
          $pull: { cartItems: { products: details.products } }
        }).then( (response) => {
          resolve({ removeProduct: true })
        })
    } else {
      console.log(count);
      Addcart.updateOne({ 'cartItems._id': details.cart, 'cartItems.products': details.products },
        {

          $inc: { 'cartItems.$.quandity': count }
        }
      ).then((response) => {

        resolve({ status: true })

      })
    }
  })
}


const getTotalAmount = (userId) => {
  // console.log("total amtt");
  return new Promise(async (resolve, reject) => {
    let id = mongoose.Types.ObjectId(userId);

    let cart = await Addcart.aggregate([
      {
        $match: { user: id }
      },
      {
        $unwind: '$cartItems'
      },
      {
        $project: {
          Id: '$cartItems.products',
          total: { $multiply: ["$cartItems.price", "$cartItems.quandity"] }
        }
      }
    ])
    console.log(cart);
    const carts = await Addcart.findOne({ user: userId })
    console.log("gfhfdffdh");
    console.log(carts);
    if (carts) {
      cart.forEach(async (amt) => {
        console.log(amt);
        await Addcart.updateMany({ 'cartItems.products': amt.Id }, { $set: { 'cartItems.$.subtotal': amt.total } })
      })
    }
    resolve()
  })

}
//calculate grand total amount//

const getGrandTotal = (userId) => {
  console.log(userId);
  return new Promise(async (resolve, reject) => {
    cart = await Addcart.findOne({ user: userId })
    console.log(cart);
    let id = mongoose.Types.ObjectId(userId)
    if (cart) {
      let totalAmount = await Addcart.aggregate([
        {
          $match: { user: id }
        },
        {
          $unwind: '$cartItems'
        },
        {
          $project: {

            subtotal: "$cartItems.subtotal",
            shippingCharge: "$cartItems.shippingCharge"
          },

        },
        {
          $project: {
            subtotal: 1,
            shippingCharge: 1
          }
        },
        {
          $group: {
            _id: null,
            total_am: { $sum: "$subtotal" },
            ship: { $sum: "$shippingCharge" }
          }
        },
        {
          $addFields: {
            total: { $sum: ["$total_am", "$ship"] }
          }
        }
      ])
      console.log(totalAmount);
      if (totalAmount == null) {
        resolve({ status: true })
          } else {
        let grandTotal = totalAmount.pop();
        console.log("fgfhfgfhfgfhfgfhfgfhf");
        console.log("%j", grandTotal)
        await Addcart.findOneAndUpdate({ user: userId }, { $set: { total: grandTotal.total, total_a: grandTotal.total_am } })
        //    resolve({status:true})
        resolve(grandTotal)
        console.log("%j", grandTotal);
      }
    }
    else {
      resolve()
    }

  })

}
function getCartDetails(userId) {
  return new Promise(async (resolve, reject) => {
    const cartDetails = await Addcart.find({ user: userId }).populate({ path: 'cartItems.products', populate: { path: 'brandname' } }).lean();
    resolve(cartDetails);
  });

}

//product id finding cart//
const getCartProductList = (userId) => {
  return new Promise(async (resolve) => {
    id = mongoose.Types.ObjectId(userId)
    let cart = await Addcart.aggregate([
      {
        $match: {
          user: id
        }
      },
      {
        $unwind: '$cartItems'
      }, {
        $project: {
          _id: '$cartItems.products'
        }
      }
    ])

    resolve(cart)

  })
}
//get order details//
const getUserOrders = (userId) => {
  return new Promise(async (resolve) => {
    let orderdt = await Orders.find({ user: userId }).populate({ path: 'productDt', populate: { path: 'brandname' } }).lean()
    resolve(orderdt)
  })
}

//get orderproductdetails
const getOrderProducts = (orderId) => {
  return new Promise(async (resolve) => {
    const orderproDetails = await Orders.find({ _id: orderId }).populate({ path: 'productDt', populate: { path: 'brandname' } }).lean()
    resolve(orderproDetails)

  })

}


const getCartCount = (userId) => {
  return new Promise(async (resolve, reject) => {
    let count = 0
    let cart = await Addcart.findOne({ user: userId })
    if (cart) {
      count = cart.cartItems.length
    }
    console.log(count);
    resolve(count)
  })
}
//Delete cart Product//
const deleteCart = (proId) => {
  return new Promise((resolve, reject) => {
    console.log(proId);
    Addcart.updateOne({ 'cartItems.products': proId }, {
      $pull: { cartItems: { products: proId } }
    }).then((r) => {
      resolve()
    })

  })
}

//Add to wish list//
const addWishList = (userId, proId) => {
  return new Promise(async (resolve, reject) => {
    let = proExist = await Wishlist.findOne({ user: userId, 'wishItems.products': proId })
    if (!proExist) {
      Wishlist.updateOne({ user: userId }, {
        $push: {
          wishItems: { products: proId }
        }
      }, { upsert: true }).then((r) => {
      })
      resolve()
    } else {
      resolve()
    }
  })
}

//get wishlist //
const getWishList = (userId) => {
  return new Promise(async (resolve, reject) => {
    let wish = await Wishlist.find({ user: userId }).populate({ path: 'wishItems.products', populate: { path: 'brandname' } }).lean()
    resolve(wish)
  })
}
//Wish-list count//
const wishListCount = (userId) => {
  return new Promise(async (resolve, reject) => {
    let count = 0
    let wish = await Wishlist.findOne({ user: userId })
    if (wish) {
      count = wish.wishItems.length
    }
    resolve(count)
  })
}
//Wish lisst item delete//
const deleteWishList = (proId) => {
  return new Promise(async (resolve, reject) => {
    let prodExist = await Wishlist.findOne({ 'wishItems.products': proId })
    if (prodExist) {
      Wishlist.updateOne({ 'wishItems.products': proId },
        {
          $pull: { wishItems: { products: proId } }
        }).then((r) => {
          resolve()
          console.log(r)
        })
    }

  })
}

//product showing check out page//
const getCheckOut = (userId) => {
  return new Promise((resolve, reject) => {
    Addcart.findOne({ user: userId }).populate({ path: 'cartItems:products', populate: { path: 'brandname' } }).lean()
    resolve()
  })
}

//user profile addres showing  order placed page//
const profileDetails = (profileData, userEmail) => {
  return new Promise(async (resolve, reject) => {
    userModel.findOneAndUpdate({ email: userEmail }, {
      $set: {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        address: profileData.address,
        country: profileData.country,
        pincode: profileData.pincode,
        state: profileData.state,
        city: profileData.city,

      }
    }).then((profileDt) => {
      resolve()
    })

  })
}
//show user details//
const getUserDetails = (user) => {
  return new Promise(async (resolve, reject) => {
    const userDetails = await userModel.findOne({ _id: user }).lean()
    resolve(userDetails)
  })
}
//New Shipping address ad to data base//
const addShippingAddress = (addressData, userId) => {
  return new Promise(async (resolve, reject) => {
    const newAddress = new Shipping({
      user: userId,
      first_name: addressData.first_name,
      last_name: addressData.last_name,
      email: addressData.email,
      address: addressData.address,
      country: addressData.country,
      state: addressData.state,
      city: addressData.city,
      pincode: addressData.pincode,
      phone: addressData.phone,
    });
    await newAddress.save((err, result) => {
      if (err) {
        reject({ msg: "address not added" });
      } else {
        resolve({ msg: "address added" });
      }
    });
  });
}
//newly added address showing address selecting page//
const getAlladdress = (userId) => {
  return new Promise(async (resolve, reject) => {
    const address = await Shipping.find({ user: userId }).lean()
    resolve(address)
  })
}
//seletctinf alredy added address//  
const selectAddedAddress = (addressId) => {
  return new Promise(async (resolve, reject) => {
    const address = await Shipping.updateMany({}, { $set: { status: false } })
    if (address) {
      await Shipping.findByIdAndUpdate({ _id: addressId }, { $set: { status: true } })
      resolve({ msg: "address selected" })
    }
    else {
      resolve({ msg: "address not selected" })
    }

  })
}
//get selected shipping address to checkout page//
const getShippingAddress = () => {
  return new Promise(async (resolve, reject) => {
    const shippingAddress = await Shipping.findOne({ status: true }).lean()
    resolve(shippingAddress)
  });
}

//checking payment-method cod/online//
const placeOrder = (order, products, total) => {
  return new Promise((resolve, reject) => {
    let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
    let orderObj = {
      first_name: order.first_name,
      last_name: order.last_name,
      email: order.email,
      address: order.address,
      country: order.country,
      state: order.state,
      city: order.city,
      pincode: order.pincode,
      phone: order.phone,
      user: order.userId,
      paymentMethod: order['payment-method'],
      productDt: products,
      totalAmount: total,
      status: status,
      OrderStatus: 'Placed'
    }
    Orders(orderObj).save().then((response) => {
      Addcart.deleteOne({ user: order.userId }).then((response) => {
        resolve({ status: true })
      })

      resolve(response._id)
    })

  })
}

//get grandTotal//
const getOrderTotal = (userId) => {
  console.log("wwwwwwwwwww");
  console.log(userId);
  return new Promise(async (resolve, reject) => {
    let grandtotal = await Addcart.findOne({ user: userId })
    console.log("222333");
    console.log(grandtotal);
    resolve(grandtotal.total)

  })
}
//generate razorpay//
const generateRazorpay = (orderId, total) => {
  return new Promise((resolve) => {
    var options = {
      amount: total * 10,  // amount in the smallest currency unit
      currency: "INR",
      receipt: "" + orderId
    };
    instance.orders.create(options, function (err, order) {
      console.log("new order", order);
      resolve(order)
    });

  })
}

//verify payment//
const verfiyPayment = (details) => {

  return new Promise((resolve, reject) => {
    const crypto = require('crypto')
    let hmac = crypto.createHmac('sha256', 'sge3RBNDWPEBxcwimONfDztx')
    hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
    hmac = hmac.digest('hex')
    if (hmac == details['payment[razorpay_signature]']) {
      resolve()
    } else {
      reject()
    }

  })
}

//change payment  status//
const changePaymentStatus = (orderId) => {
  return new Promise((resolve) => {
    Orders.updateOne({ _id: orderId }, {
      $set: {
        status: 'placed'
      }
    }).then(() => {
      resolve()
    })
  })
}

//filtering by brand //
const getAllBrand = (user) => {
  return new Promise(async (resolve, reject) => {
    let brands = await Brand.find({}).lean()
    resolve(brands)
  })
}

//get subcategory
const displaySubCat = (catId) => {
  console.log(catId);
  return new Promise(async (resolve, reject) => {
    let displaysub = await Product.find({ brandname: catId }).lean()
    // let prod=await Products.find({subcategoryname:displaysub}).lean()
    resolve(displaysub)
  })
}

// offer adding funcation//
const Offer = () => {
  return new Promise(async (resolve, reject) => {
    let dt = await Brand.findOne({ brandname: 'Asus' })
    let pt = await Product.find({ brandname: dt._id }).populate('brandname').lean()
    resolve(pt)
  })
}

//cancelorder
const cancelOrder = (orderId) => {
  return new Promise(async (resolve, reject) => {
      const cancel = await Orders.updateOne({ _id: orderId }, {
          $set: {
            orderCancelled: true,
            OrderStatus: 'cancelled'
          }
      })
      resolve(cancel)
  })
}








module.exports = {
  verifyOTP,
  doSignup,
  getproductdetail,
  updateNewPassword,
  forgetPasswordOTP,
  forgetPasswordEmailVerify,
  getUserResetPage,
  addToCart,
  getCartDetails,
  getCartCount,
  deleteCart,
  addWishList,
  getWishList,
  wishListCount,
  deleteWishList,
  getCheckOut,
  changeProductQuandity,
  getTotalAmount,
  getGrandTotal,
  profileDetails,
  getUserDetails,
  getAlladdress,
  addShippingAddress,
  selectAddedAddress,
  getShippingAddress,
  placeOrder,
  getOrderTotal,
  generateRazorpay,
  verfiyPayment,
  changePaymentStatus,
  getCartProductList,
  getUserOrders,
  getOrderProducts,
  getAllBrand,
  displaySubCat,
  Offer,
  cancelOrder,





  doLogin: (data) => new Promise(async (resolve, reject) => {
    const response = {};
    await userModel.findOne({ email: data.email }).then(async (user) => {
      if (user) {
        if (user.block == false) {
          console.log(user.block == false);
          const status = await bcrypt.compare(data.password, user.password);

          if (status) {
            response.user = user
            response.status = true
            response.user = user
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
  //Vendor added product showimg user home page//
  getAllProduct: () => {
    return new Promise(async (resolve, reject) => {
      let cardProduct = await Product.find().lean().populate('brandname')
      resolve(cardProduct)
    })
  }
}


