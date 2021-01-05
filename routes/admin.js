var express = require('express');
const { response } = require('../app');
var router = express.Router();
var adminHelpers=require('../helpers/admin-helpers')
var dealerHelpers=require('../helpers/dealer-helpers')
var productHelpers=require('../helpers/product-helpers')

//middleware function for entering nodejs
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn) {
    next();
  }
  else {
    res.send("<h1>😢Ooops!!Please login the page</h1>")
  }
}
//redirecting to admin/
router.get('/', function(req, res, next) {
 
  console.log("details"+req.session.user);
  if(req.session.user)
  {
   
    res.redirect('/')
  }
  else
  {
    res.render('admin/login',{"loginErr":req.session.userLoginErr,dealer:true})
    req.session.userLoginErr=false
  }
});
/*just for registering the data
router.get('/signup',function(req,res){
    res.render('admin/signup',{admin:true})
})
router.post('/signup',(req,res)=>{
    adminHelpers.doSignup(req.body).then((response)=>{
      console.log(response)
    })
  })*/
  //redirecting to admin login if its success it is redirected to admins dashboard else on same page
  router.post('/login',(req,res)=>{
    adminHelpers.doLogin(req.body).then((response)=>{
      console.log(response)
      if(response.status) {
        req.session.loggedIn=true
        req.session.user=response.user
       
        res.redirect('/admin/dashboard')
      } else {
        req.session.userLoginErr="Invalid username or password"
        res.redirect('/admin')
      }
    })
  })
  //used for adding dealers
  router.get('/add-dealers',(req,res)=>{
    res.render('admin/add-dealers',{admin:true})
  })
  //used for posting dealers
  router.post('/add-dealers',(req,res)=>{
    console.log(req.body)
    
     dealerHelpers.addDealers(req.body).then((response)=>{
       console.log(response)
       res.redirect('/admin/dashboard')
     })
 
  })
  //used for admin logout
  router.get('/logout',(req,res)=>{
    req.session.destroy()
    res.redirect('/admin')
  })
  //for entering the dashboard
   router.get('/dashboard',verifyLogin,async (req,res)=>{
    let noofproducts=await adminHelpers.getProducts()
    console.log(noofproducts)
    let noofusers=await adminHelpers.getUsers()
    console.log(noofusers)
    let noofdealers=await adminHelpers.getDealers()
    console.log(noofdealers)
    let nooforders=await adminHelpers.getOrders()
    console.log(nooforders)
    let user=req.session.user
    console.log(user)
    let users=await dealerHelpers.getAllUsers()
    console.log(users)
    let products=await productHelpers.getAllProducts()
    dealerHelpers.getAllDealers().then((dealers)=>{
  

      var datetime = new Date();
    console.log(datetime);
   
      res.render('admin/dashboard',{dealers,user,dashboard:true,noofproducts,noofusers,noofdealers,nooforders,datetime,users,products})
    })
     
    })
    //TO DELETE A DEALER with its specific id
    router.get('/delete-dealer/:id',(req,res)=>{
      let dealerId=req.params.id
      console.log(dealerId)
      dealerHelpers.deleteDealer(dealerId).then((response)=>{
        res.redirect('/admin/dashboard')
      })
    })  
    //TO EDIT A DEALER
    router.get('/edit-dealer/:id',async (req,res)=>{
      let dealer=await dealerHelpers.getDealerDetails(req.params.id)
      console.log(dealer);
      res.render('admin/edit-dealer',{dealer,admin:true})
    })
    router.post('/edit-dealer/:id',(req,res)=>{
      console.log(req.params.id)
      //let id=req.params.id
      dealerHelpers.updateProduct(req.params.id,req.body).then(()=>{
        res.redirect('/admin/dashboard')
       
      })
    })
    router.get('/all-products',async (req,res)=>{
      let products=await productHelpers.getAllProducts()
      res.render('admin/all-products',{products,admin:true})
    })
module.exports = router;