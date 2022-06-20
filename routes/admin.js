const { response } = require('express');
var express = require('express');
const req = require('express/lib/request');
var router = express.Router();
const adminHelper = require('../helpers/admin-helpers');
const userHelpers = require('../helpers/user-helpers');


let adminName;
/* GET home page. */
router.get('/', async function (req, res, next) {
  let admin;
  if (req.session.adminLogin) {
    let UserCount =await adminHelper.UserCount()
    let VendorCount = await adminHelper.VendorCount()
    let OrderCount = await adminHelper.OrderCount()
    let Totalsale = await adminHelper.getTotalAmount()
    admin = true
    res.render('admin/admin-home', { admin: true,UserCount,VendorCount,OrderCount,Totalsale });
    admin = false;
  } else {
    res.redirect('/admin/login')
  }

});
router.get('/login', (req, res) => {
  const errMsg = 'Invalid username or password'
  if (req.session.adminErr) {
    res.render('admin/login', { errMsg })
    req.session.adminErr = false;
  } else {
    res.render('admin/login')
  }

})

router.post('/login', async (req, res) => {
  const response = await adminHelper.doLogin(req.body);
  if (response.status) {
    req.session.adminLogin = true;
    req.session.admin = response
    res.redirect('/admin')
  } else {
    req.session.adminErr = true
    res.redirect('/admin/login')
  }
})
//Log out//
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/admin')
})

//user management page rendering//
router.get('/user-mng', (req, res) => {
  adminHelper.userInfo().then((users) => {
    res.render('admin/user-mng', { admin: true, users })
  })

})
//seller managment page rendering//
router.get('/seller-mng', (req, res) => {
  adminHelper.vendorInfo().then((vendors) => {
    res.render('admin/seller-mng', { admin: true, vendors })
  })
})
//Order management//
router.get('/pending', async(req, res) => {
  let showDt= await adminHelper.getallOrderDt()
  res.render('admin/pending', { admin: true,showDt })
})

//user block
router.get("/blockUser/:id", (req, res) => {
  const proId = req.params.id; 
  adminHelper.blockUser(proId).then((response) => {
    res.json({status:true})
    });
});

//user unblock
router.get("/unBlockUser/:id", (req, res) => {
  const proId = req.params.id;
  adminHelper.unBlockUser(proId).then((response) => {  
  });
});

//vendor block//
router.get("/blockVendor/:id",(req,res)=>{
  const vendorId = req.params.id
  adminHelper.blockVendor(vendorId).then((response)=>{
    res.json({status:true})
  })
})
//Unblock Vendor//
router.get('/unBlockVendor/:id',(req,res)=>{
  const vendorId= req.params.id
  adminHelper.unBlockVendor(vendorId).then((response)=>{
    res.json({status:true})
  }) 
})
//Order shipped Router//
router.get('/order-shipped:id',(req,res)=>{
  adminHelper.orderStatusShipped(req.params.id).then(()=>{
    console.log("000000");
    console.log(req.params.id);
    res.redirect('/admin/pending')
  })
})
//Order Delivered router//
router.get('/order-delivered:id',(req,res)=>{
  adminHelper.orderStatusDeliverd(req.params.id).then(()=>{
    res.redirect('/admin/pending')
  })
})

// //success ordermanage render
// router.get("/order-manage",async(req,res)=>{
//   let orderList=await adminHelper.getUserOrders()
//     res.render('admin/order-manage',{admin:true,orderList})
// })

//cancel order
router.get("/cancell-order",async(req,res)=>{
  let orderList=await adminHelper.getCancelOrders()
    res.render('admin/cancell-order',{admin:true,orderList})
})
//view Brands//
router.get('/view-brands',async(req,res)=>{
  let brand= await userHelpers.getAllBrand()
  res.render('admin/view-brands',{admin:true,brand})
})
//Delete Product//
router.get('/delete-brand/:id',(req,res)=>{
  console.log("huhuhuhuhuh");
  console.log(req.params.id);
  let brand=req.params.id
  adminHelper.deleteBrand(brand).then(()=>{
    console.log(brand);
    res.redirect('/admin/view-brands')
  })
})

module.exports = router;
