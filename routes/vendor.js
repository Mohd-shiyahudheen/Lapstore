/* eslint-disable linebreak-style */
const express = require('express');
const { viewproduct } = require('../helpers/vendor-helpers');
const vendorHelpers = require('../helpers/vendor-helpers');
const Product = require('../model').Product
const Vendor = require('../model').Vendor
const ObjectId = require('mongodb');
const router = express.Router();




let vendorName;
/* GET users listing. */
router.get('/', async (req, res) => {
  let vendorHeader;
  const vendor = req.session.vendor
  if (req.session.vendorLogin) {
    let totalSales = await vendorHelpers.getTotalAmount()
    let totalOrder = await vendorHelpers.OrderCount()
    let totalProduct = await vendorHelpers.TotalProduct()
    vendorName = vendor.name
    res.render('vendor/vendor-home', { vendorName, totalSales, totalOrder, totalProduct });
  } else {
    res.render('vendor/login')
  }
  vendorHeader = false;
});

// Get login page//
router.get('/login', (req, res) => {
  let errMsg = req.session.loginErr?'Please enter valid email or password':"";

  res.render('vendor/login',{loginErr:req.session.loginErr,errMsg});
  // eslint-disable-next-line linebreak-style
});
//posting vendor data//
router.post('/login', async (req, res) => {

  const response = await vendorHelpers.doLogin(req.body)

  if (response.status) {
    req.session.vendor = response.vendor
    req.session.loginErr = false
    req.session.vendorLogin = true;
    res.redirect('/vendor')
  } else {
    req.session.vendorLogin = false
    req.session.loginErr = true
    res.redirect('/vendor/login')
  }
})

// get sign up page//
router.get('/signup', (req, res) => {
  res.render('vendor/signup');
});
// sign up data post to database//
router.post('/signup', async (req, res) => {
  let response = await vendorHelpers.doSignup(req.body)
  console.log(response)
  if (response.email) {
    req.session.vendor = response;
    req.session.vendorLogin = true;
    res.redirect('/vendor');
  } else {
    res.redirect('/vendor/signup')
    console.log(response)
  }

});

//logout and session destroid//
router.get('/logout', (req, res) => {
  req.session.destroy()
  console.log('destroyed')
  vendorName = undefined;
  res.redirect('/vendor/login')
})

//rendering or viewing products list to vendor//
router.get('/view-products', (req, res) => {
  if (req.session.vendorLogin) {
    vendorHelpers.viewProducts().then((Product) => {
      res.render('vendor/view-products', { vendorHeader: true, vendorName, Product })
    })
  } else {
    res.render('vendor/login')
  }
})

//Rendering add-product page and show add product form//
router.get('/add-product', async (req, res) => {
  if (req.session.vendorLogin) {
    const brands = await vendorHelpers.getBrandDetails()
    res.render('vendor/add-product', { vendorHeader: true, vendorName, brands })
  } else {
    res.render('vendor/login')
  }
})

//sellers posting his product to data base//
router.post('/add-product', vendorHelpers.upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), (req, res) => {
  let firstImage = req.files.image1[0].filename
  let secondImage = req.files.image2[0].filename
  console.log(req.body);
  vendorHelpers.addProduct(req.body, firstImage, secondImage).then((response) => {
    res.redirect('/vendor/view-products')
  })
})

//Vendor profile Detailes showing page //
router.get('/account-detailes', async (req, res) => {
  if (req.session.vendorLogin) {
    const data = req.session.vendor
    const vendor = await Vendor.findOne({ _id: data._id })
    console.log(vendor)
    res.render('vendor/account-detailes', { vendorHeader: true, vendorName, vendor })
  } else {
    res.render('vendor/login')
  }
})

router.post('/account-detailes/:id', async (req, res) => {
  const id = req.params.id
  console.log(req.body.name);
  const response = await Vendor.findOneAndUpdate(
    { _id: id }, {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    location: req.body.location
  }
  )
  console.log(response);
  res.redirect('/vendor/account-detailes')
})

//vendor edit added products//
router.get('/edit-product/:id', async (req, res) => {
  // vendorHelpers.getProductDetails(req.params.id).then((response) => {
  let response = await vendorHelpers.getProductDetails(req.params.id)
  const brands = await vendorHelpers.getBrandDetails()
  res.render('vendor/edit-product', { response, vendorHeader: true, vendorName, brands })
})
// })

//post editedbvendor details//
router.post('/edit/:id', vendorHelpers.upload.fields([{ name: "image1", maxCount: 1 }, { name: "image2", maxCount: 1 }]), async (req, res) => {
  const id = req.params.id
  console.log(id);
  let product_det = await Product.findById(id).lean()
  console.log(product_det)
  let firstImage = req.files.image1 ? req.files.image1[0].filename : product_det.image[0].first
  let secondImage = req.files.image2 ? req.files.image2[0].filename : product_det.image[0].second


  vendorHelpers.updateProduct(req.params.id, req.body, firstImage, secondImage).then((response) => {
    res.redirect('/vendor/view-products')
  })

})


//Delete products//
router.get('/delete-product/:id', (req, res) => {
  let productId = req.params.id
  vendorHelpers.deleteProduct(productId).then((response) => {
    res.redirect('/vendor/view-products')
  })
})

//View order detailes list //
router.get('/order', async (req, res) => {
  if (req.session.vendorLogin) {
    let orderDt = await vendorHelpers.getallOrderDt()
    res.render('vendor/order', { vendorHeader: true, vendorName, orderDt })
  } else {
    res.render('vendor/login')
  }
})

//otp-verification page rendering//
router.get('/verify-otp', (req, res) => {
  if (req.session.vendorLogin) {
    res.render('vendor/verify-otp')
  } else {
    res.render('vendor/login')
  }
})
router.get('/add-brand', (req, res) => {
  res.render('vendor/add-brand', { vendorHeader: true })
})
//posting brand name//
router.post('/add-brand', (req, res) => {
  vendorHelpers.addBrandName(req.body).then((data) => {
    res.redirect('/vendor/view-products')
  })
})
// helo
module.exports = router;