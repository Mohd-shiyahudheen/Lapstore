/* eslint-disable no-shadow */
const express = require('express');
const userHelpers = require('../helpers/user-helpers');
const { User } = require('../model');
const { response } = require('express');
const { json } = require('express/lib/response');

const router = express.Router();


const verifyLogin = (req, res, next) => {
  if (req.session.user) {
    next()
  }
  else {
    res.redirect('/login');
  }
}


let userName;
/* GET users listing. */

router.get('/', async (req, res) => {
  let userHeader;
  const user = req.session.user
  let cardProduct = await userHelpers.getAllProduct()
  let brands = await userHelpers.getAllBrand()


  if (req.session.doLogin) {
    userName = user.first_name + " " + user.last_name
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    let wishCount = await userHelpers.wishListCount(req.session.user._id)

    res.render('index', { userHeader: true, userName, cardProduct, cartCount, wishCount,brands });
  } else {
    res.render('index', { userHeader: true, cardProduct,brands });
  }
  userHeader = false;
});


// --Get Login Page--/
router.get('/login', (req, res) => {
  let loginErr
  const errorMsg = 'Invalid Email or Password'
  if (req.session.loginErr === true) {
    loginErr = true
  } else {
    loginErr = false
  }
  res.render('user/login', { loginErr, errorMsg });
  req.session.loginErr = false
});
//posting user data//
router.post('/login', async (req, res) => {

  const response = await userHelpers.doLogin(req.body)

  if (response.status) {
    req.session.user = response.user
    req.session.loginErr = false
    req.session.doLogin = true;
    res.redirect('/')
  } else {
    req.session.doLogin = false
    req.session.loginErr = true
    res.redirect('/login')
  }
})
// --Get Sign Up Page--//
router.get('/signup', (req, res) => {

  res.render('user/signup');
});
//posting sign up Detailes//
router.post('/signup', userHelpers.doSignup)

//user profile page //
router.get('/user-profile', async (req, res) => {
  const user = req.session.user
  const details = await userHelpers.getUserDetails(user)
  console.log("lllll");
  console.log(details);
  res.render('user/user-profile', { user, details, userHeader: true, userName })
})

//post profile detail
router.post('/user-profile', (req, res) => {
  console.log(req.body);
  const user = req.session.user
  userHelpers.profileDetails(req.body, user.email).then((response) => {
    console.log('33333333');
    console.log(response);
    res.redirect('/user-profile')
  })
})

//logout session clearing and redirect login//
router.get('/logout', (req, res) => {
  console.log('logout');
  req.session.destroy()  //in this code use to clear session or destroied sesssion//
  res.redirect('/')
})


//product full detailes showing page//
router.get('/product-zoom:id', verifyLogin, async (req, res) => {
  let wishCount = await userHelpers.wishListCount(req.session.user._id)
  let cartCount = await userHelpers.getCartCount(req.session.user)
  userHelpers.getproductdetail(req.params.id).then((data) => {
    res.render('user/product-zoom', { data, userHeader: true, userName, wishCount, cartCount });
  })
})
//otp rendering page//
router.get('/verify-otp', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('user/verify-otp')
  }
})
//posting otp//
router.post('/verifyotp', userHelpers.verifyOTP)

//Enter email page rendering //
router.get('/enter-email', userHelpers.getUserResetPage)
//Email posting//
router.post('/enter-email', userHelpers.forgetPasswordEmailVerify)
//Enter otp page rendering//
router.get('/enter-otp', (req, res) => {
  res.render('user/enter-otp')
})
//posting otp//
router.post('/enter-otp', userHelpers.forgetPasswordOTP)
//rendring newpassword entering page//
router.get('/new-password', (req, res) => {
  res.render('user/new-password')
})
//posting resetpassword//
router.post('/new-password', userHelpers.updateNewPassword)
//rendering cart viewn page//
router.post('/cart-view/:id', (req, res) => {
  userHelpers.addToCart(req.params.id, req.session.user._id).then((response) => {
    res.json(response)
  }).catch(() => {
    res.redirect('/')
  })
})
//cart page render
router.get('/cart-view', verifyLogin, async (req, res) => {
  let subTotal = await userHelpers.getTotalAmount(req.session.user._id)
  let grandTotal = await userHelpers.getGrandTotal(req.session.user._id)
  let cartProducts = await userHelpers.getCartDetails(req.session.user._id)
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  let wishCount = await userHelpers.wishListCount(req.session.user._id)
  res.render('user/cart-view', { subTotal, grandTotal, cartProducts, userHeader: true, userName, cartCount, wishCount })
})
//change product Quandity in car//
router.post('/change-product-quandity', (req, res) => {
  let user = req.session.user
  userHelpers.changeProductQuandity(req.body, user).then((response) => {
    res.json(response)
  })
})
//cart page product delete//
router.get('/delete-cart/:id', (req, res) => {
  userHelpers.deleteCart(req.params.id).then(() => {
    res.redirect('/cart-view')
  })
})
// whish-list page rendering //
router.get('/wish-list', verifyLogin, async (req, res) => {
  const wish = await userHelpers.getWishList(req.session.user._id)
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  let wishCount = await userHelpers.wishListCount(req.session.user._id)
  res.render('user/wish-list', { wish, userHeader: true, userName, cartCount, wishCount })
})
//wish-list page show//
router.get('/wish-list/:id', verifyLogin, (req, res) => {
  userHelpers.addWishList(req.session.user._id, req.params.id).then(() => {
    res.redirect('/')
  })
})
// wish list  product deleting//
router.get('/delete-wishlist/:id', (req, res) => {
  userHelpers.deleteWishList(req.params.id).then(() => {
    res.redirect('/wish-list')
  })
})
//billing page rendering//
router.get('/billing-address', verifyLogin, async (req, res) => {
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  let wishCount = await userHelpers.wishListCount(req.session.user._id)
  let addressData = await userHelpers.getAlladdress(req.session.user._id)
  res.render('user/billing-address', { userHeader: true, cartCount, wishCount, addressData, userName })
})
router.get('/selectAddedAddress/:id', (req, res) => {
  userHelpers.selectAddedAddress(req.params.id).then((response) => {
    res.json(response)
  })
})
//post billimg detailes to database//
router.post('/billing-address', (req, res) => {
  userHelpers.addShippingAddress(req.body, req.session.user._id).then(() => {
    res.redirect('/billing-address')
  })
})


//check out page rendering//
router.get('/checkout', async (req, res) => {
  let user = req.session.user
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  let wishCount = await userHelpers.wishListCount(req.session.user._id)
  let grandTotal = await userHelpers.getGrandTotal(req.session.user._id)
  let cartProducts = await userHelpers.getCartDetails(req.session.user._id)
  let shippingDt = await userHelpers.getShippingAddress()
  res.render('user/checkout', { userHeader: true, userName, grandTotal, cartProducts, shippingDt, user, cartCount, wishCount })
})
//posting data to order placed pagell
router.post('/checkout', async (req, res) => {
  let total = await userHelpers.getOrderTotal(req.session.user._id)
  let products = await userHelpers.getCartProductList(req.session.user._id)
  userHelpers.placeOrder(req.body, products, total).then((orderId) => {
    if (req.body['payment-method'] === 'COD') {
      res.json({ codSuccess: true })
    } else {
      userHelpers.generateRazorpay(orderId, total).then((response) => {
        res.json(response)
      })
    }
  })
  console.log(req.body);
})


router.post('/verify-payment', (req, res) => {
  console.log(req.body);
  userHelpers.verfiyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      res.json({ status: true })
    })
  }).catch(() => {
    res.json({ status: false, errMsg: '' })
  })
})

//Order confirmation Page//
router.get('/place-order', async (req, res) => {
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  let wishCount = await userHelpers.wishListCount(req.session.user._id)
  res.render('user/place-order', { userHeader: true, userName, cartCount, wishCount })
})

//display order//
router.get('/display-order', async (req, res) => {
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  let wishCount = await userHelpers.wishListCount(req.session.user._id)
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/display-order', { orders, userHeader: true, userName, cartCount, wishCount })
})
//view ordererd product//
router.get('/view-order-product:id', async (req, res) => {
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  let wishCount = await userHelpers.wishListCount(req.session.user._id)
  let orderProduct = await userHelpers.getOrderProducts(req.params.id)
  console.log("popopopopopopo");
  console.log(orderProduct);
  res.render('user/view-order-product', { orderProduct, userHeader: true, userName, cartCount, wishCount })
})

//search product//
router.post('/search', async (req, res) => {
  let searchText = req.body['search_name'];
  try {
    let products=await userHelpers.getAllProduct()
  if (searchText) {
   let cardProduct=products.filter((u) => u.productname.includes(searchText));
      res.render('index',{cardProduct,userHeader:true})  
    } 
  } catch (err) {
   console.log(err);
  }
})

//get subcategory
router.get('/find-subcat:id',async(req,res)=>{
 let category=await userHelpers.displaySubCat(req.params.id)
 console.log(category);
  console.log('99999');
    res.render('sorting',{category,userHeader:true})
})

//Offer page rendering//
router.get('/offer',async(req,res)=>{
  let offer = await userHelpers.Offer()
  res.render('user/offer',{userHeader:true,offer})
})
//order cancel
router.get('/cancel-order/:id',(req,res)=>{
  userHelpers.cancelOrder(req.params.id).then(()=>{
    res.redirect('/display-order')
  })
 })


module.exports = router; 
