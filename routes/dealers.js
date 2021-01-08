var express = require('express');
var router = express.Router();
var dealerHelpers=require('../helpers/dealer-helpers')
var productHelpers=require('../helpers/product-helpers')
//this error is for accessing dashboard middleware
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn) {
    next();
  }
  else {
    res.send("<h1>😢Ooops!!Please login the page</h1>")
  }
}
//going to dealers login page if it is not present it will display error
router.get('/', function(req, res, next) {
 
  console.log("details"+req.session.user);
  if(req.session.user)
  {
   
    res.redirect('/')
  }
  else
  {
    res.render('dealers/login',{"loginErr":req.session.userLoginErr,dealer:true})
    req.session.userLoginErr=false
  }
});
//comparing the datas and for getting specific page
router.post('/login',(req,res)=>{
  dealerHelpers.doLogin(req.body).then((response)=>{
    console.log(response)
    if(response.status) {
      req.session.loggedIn=true
      req.session.user=response.user
     
      res.redirect('/dealers/dashboard')
    } else {
      req.session.userLoginErr="Invalid username or password"
      res.redirect('/dealers')
    }
  })
})
router.get('/add-products',(req,res)=>{
  res.render('dealers/add-products',{dealer:true})
})
router.post('/add-products',(req,res)=>{
  console.log(req.body)
  console.log(req.files.Image)
  productHelpers.addProduct(req.body,(id)=>{
    let image=req.files.Image
    console.log(id)
    image.mv('./public/product-images/'+id+'.jpg',(err)=>{
      if(!err) {
        res.redirect("/dealers/dashboard")
      } else {
        console.log(err)
      }
    })
 
  })
})
//for accessing the dashboard
 router.get('/dashboard',verifyLogin,async (req,res)=>{
    let noofproducts=await dealerHelpers.getProducts()
    console.log(noofproducts)
    let noofusers=await dealerHelpers.getUsers()
    console.log(noofusers)
  
    let nooforders=await dealerHelpers.getOrders()
    console.log(nooforders)
    let user=req.session.user
    let users=await dealerHelpers.getAllUsers()
    console.log(users)
    let orders=await dealerHelpers.getAllOrders()

    productHelpers.getAllProducts().then((products)=>{
      console.log(products) 
    res.render('dealers/dashboard',{user,admin:true,noofproducts,noofusers,nooforders,products,users,orders})
     })
   
    })
    router.get('/delete-product/:id',(req,res)=>{
      let proId=req.params.id
      console.log(proId)
      productHelpers.deleteProduct(proId).then((response)=>{
        res.redirect('/dealers/dashboard')
      })
    })
  router.get('/orders',async(req,res)=>{
    let orders=await dealerHelpers.getUserOrders(req.session.user._id)
    res.render('dealers/orders',{user:req.session.user,orders})
  })

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/dealers')
})
//to delete a particular product

//to edit a particular product
router.get('/edit-product/:id',async (req,res)=>{
  let product=await productHelpers.getProductDetails(req.params.id)
  console.log(product);
  res.render('dealers/edit-product',{product,dealer:true})
})
//to edit the details of a product
router.post('/edit-product/:id',(req,res)=>{
  console.log(req.params.id)
  let id=req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/dealers/dashboard')
    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/product-images/'+id+'.jpg')
      
     
    }
  })
})
router.get('/view-users',async function(req, res, next) {
  let user=req.session.user
  
  dealerHelpers.getAllUsers().then((users)=>{
    
    res.render('dealers/view-users',{dealer:true,users,user});
   })

});
 router.get('/view-orders',async function(req, res, next) {
   let products=await dealerHelpers.getDealerProducts()
   console.log(products)

    
   dealerHelpers.getAllOrders().then((orders)=>{
   
     res.render('dealers/view-orders',{dealer:true,orders,products});
    })
   
 });
 
module.exports = router;
