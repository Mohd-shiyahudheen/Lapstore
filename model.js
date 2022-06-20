/* eslint-disable linebreak-style */
// Mongoose user data storing in mongoose //
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: 'name is required',
    minlength: 4,
  },
  last_name: {
    type: String,
    required: 'name is required',
    minlength: 4,
  },
  email: {
    type: String,
    required: 'Email is required',
    lowercase: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: 'Phone number is required',
    minlength: 10,
  },
  password: {
    type: String,
    required: 'Password is required',
    minlength: 8,
  },
  address: {
    type: String,
    default: null,
  },
  pincode: {
    type: Number,
    default: null,
  },
  country: {
    type: String,
    default: null,
  },
  state: {
    type: String,
    default: null,
  },
  city: {
    type: String,
    default: null,
  },
  role: {
    type: Number,
    default: 1
  },
  block:{
    type:Boolean,
    default:false
  }

});
const User = mongoose.model('User', userSchema);

// Vendor data storing to data base//
const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'name is required',
    minlength: 4,
  },
  email: {
    type: String,
    required: 'Email is required',
    lowercase: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: 'Phone number is required',
    minlength: 10,
  },
  location: {
    type: String,
    required: 'Email is required',
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: 'Password is required',
    minlength: 8,
  },
  active: {
    type: Boolean
  },
  block:{
    type:Boolean,
    default:false
  }

});
const Vendor = mongoose.model('Vendor', vendorSchema);

// vendor Adding product detailes to data base//


const productSchema = new mongoose.Schema({
  productname: {
    type: String,
    required: 'name is required',
    minlength: 4,
    unique: false
  },
  color: {
    type: String,
    required: 'name is required',
    minlength: 4,
  },
  price: {
    type: Number,
    required: 'Price is required',
    minlength: 5,
  },
  oldprice:{
    type:Number,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  image: {
    type: Array,
  },
  brandname: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true

  }
});
const Product = mongoose.model('Product', productSchema);

//category schema//
const brandSchema = new mongoose.Schema({
  brandname: {
    type: String,
    required: true
  }
})
const Brand = mongoose.model('Brand', brandSchema)

// Add to Cart schema//
const addcartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cartItems: [{
    products: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quandity: {
      type: Number,
      default: 1
    },
    price: {
      type: Number
    },
    subtotal: {
      type: Number,
      default: 0
    },
    shippingCharge: {
      type: Number,
      default: 60
    }

  }],
  total_a: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  }

})
const Addcart = new mongoose.model('Addcart', addcartSchema)

//Add to wish-List schema//
const addWishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wishItems: [{
    products: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    }
  }]
})
const Wishlist = new mongoose.model('Wishlist', addWishlistSchema)

//shipping address Schema//
const shippingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  first_name: {
    type: String,
    minlength: 4,
  },
  last_name: {
    type: String,
    minlength: 4,
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
  },
  phone: {
    type: Number,
    minlength: 10,
  },
  address: {
    type: String,
    minlength: 5
  },
  pincode: {
    type: Number,
    minlength: 6
  },
  country: {
    type: String,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  status: {
    type: Boolean,
    default: false
  }

});
const Shipping = mongoose.model('Shipping', shippingSchema);

//order placing Schema//

const orderDetails = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  productDt: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],

  paymentMethod: {
    type: String

  },
  status: {
    type: String
  },
  totalAmount: {
    type: Number
  },

  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  pincode: {
    type: Number,
    required: true
  },
  phone: {
    type: Number,
    required: true
  },
  OrderPlacedAt: {
    type: Date,
    default: Date.now()
  },
  OrderStatus:{
    type:String,  
  },
  orderCancelled:{
    type:Boolean,
    default:false
  }
})

const Orders = mongoose.model('Orders', orderDetails)






module.exports = { User, Vendor, Product, Brand, Addcart, Wishlist, Shipping, Orders };
