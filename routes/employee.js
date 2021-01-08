var express=require('express')
var router = express.Router();
var employeeHelpers=require('../helpers/employee-helpers')
var dealerHelpers=require('../helpers/dealer-helpers')
router.get('/', function(req, res, next) {
    let user=req.session.user
    console.log(user)
   if(user) 
   {

 
           res.render('employee/view-dash',{user,employee:true});
      
   }
   
   else {
       res.redirect('/employee/login')
   }
 });
 router.get('/login',(req,res)=>{
    console.log(req.session.user);
    if(req.session.user)
    {
     
      res.redirect('/')
    }
    else
    {
      res.render('employee/login',{"loginErr":req.session.userLoginErr,employee:true})
      req.session.userLoginErr=false
    }
   
  })
  
router.post('/login',(req,res)=>{
    employeeHelpers.doLogin(req.body).then((response)=>{
      if(response.status)
      {
       
        req.session.user=response.user
        req.session.user.loggedIn=true
        res.redirect('/employee')
      }
      else
      {
        req.session.userLoginErr="Invalid username or password"
        res.redirect('/employee/login')
      }
    })
   })
   router.get('/signup',(req,res)=>{
       res.render('employee/signup',{employee:true})
   })
   router.post('/signup',(req,res)=>{
     employeeHelpers.doSignup(req.body).then((response)=>{
         console.log(response)
      
         req.session.user=response
         req.session.user.loggedIn=true
         res.redirect('/employee')
     })
    })
    router.get('/all-dealers',async (req,res)=>{
      let dealers=await dealerHelpers.getAllDealers()
      res.render('employee/all-dealers',{dealers,employee:true,user:req.session.user})
    })
    router.get('/information',(req,res)=>{
      res.render('employee/information',{user:req.session.user,employee:true})
    })
   router.get('/logout',(req,res)=>{
    req.session.user=null
    req.session.userLoggedIn=false
    res.redirect('/employee')
  })

  module.exports = router;