var express = require('express');
var router = express.Router();
const productHelpers=require('../helpers/product-helpers')
const userHelpers=require('../helpers/user-helpers')
  // const accountSid = 'AC141eb6306753707757e44642d1261e9c'; 
  // const authToken = '4eaaa42616f41bcae31f8f559cc30a6c'; 
  // const client = require('twilio')(accountSid, authToken); 
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn) {
    next()
  }
  else {
    res.redirect('/')
  }
}
/* GET home page. */
//PASSED THE user name to display it in the hbs
router.get('/',async function(req, res, next) {
  let user=req.session.user
  console.log(user)
  let cartCount=null
  
  if(req.session.user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
  
  productHelpers.getAllProducts().then((products)=>{
   
    res.render('users/view-products',{user:true,products,user,cartCount});
   })

});
//getting login page
router.get('/login',(req,res)=>{
  console.log("details"+req.session.user);
  if(req.session.user)
  {
   
    res.redirect('/')
  }
  else
  {
    res.render('users/login',{"loginErr":req.session.userLoginErr})
    req.session.userLoginErr=false
  }
})
//getting signup page
router.get('/signup',(req,res)=>{
  res.render('users/signup')
})
//posting signup page and registering datas
//after successfull signup and it is rendering to login page
router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response)
    res.render('users/login')
  })
})
//posting login page 
//after successful login it is accessing the home page
//it will also sent verification code to mobile
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status)
    {
     
      req.session.user=response.user
      req.session.user.loggedIn=true
      console.log('hi')
  //  client.messages 
  //         .create({ 
  //            body: 'Your Account is verified', 
  //            from: '+16592045177',       
  //            to: '+919526251849' 
  //          }) 
  //         .then(message => console.log(message.sid)) 
  //         .done();
      res.redirect('/')
    }
    else
    {
      req.session.userLoginErr="❌Invalid username or password"
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/login')
})
router.get('/cart',async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
   let totalValue=0;
   if(products.length>0)
   {
     totalValue=await userHelpers.getTotalAmount(req.session.user._id)
   }
   else {
     res.redirect('/cart1')
   }
  console.log(products);
  
  res.render('users/cart',{user:req.session.user._id,products,totalValue})
})
router.get('/add-to-cart/:id',(req,res)=>{
  console.log("api call");
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
   res.json({status:true})
  })
})
router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotalAmount(req.body.user)
       res.json(response)
  })
})
router.get('/place-order',async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('users/place-order',{total,user:req.session.user})
})
router.post('/place-order',async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    console.log(orderId)
    if(req.body['payment-method'==='COD'])
    {
      res.json({codSuccess:true})
    }
    else
    {
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
       res.json(response)
      })
    }
    
  })
  console.log(req.body);
})
router.get('/order-success',(req,res)=>{
  res.render('users/order-success',{user:req.session.user})
})
router.get('/orders',async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  res.render('users/orders',{user:req.session.user,orders})
})

router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  console.log(products)
  res.render('users/view-order-products',{user:req.session.user,products,dealer:true})
})

router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log("Payment successfull");
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:''})
  })

})
router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id
  console.log(proId)
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/cart')
  })
})  
router.get('/cart1',(req,res)=>{
  res.render('users/cart1',{user:true})
})
router.get('/cart2',(req,res)=>{
  res.render('users/cart2')
})
module.exports = router;
