var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");

const { response } = require("../app");
module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(userData.Password, 10);
      db.get()
        .collection(collection.ADMIN_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          resolve(data.ops[0]);
        });
    })
    },
 doLogin:(adminData)=>{
     return new Promise(async (resolve,reject)=>{
       let loginStatus=false
       let response={}
       let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:adminData.Email})
       if(admin)
          {
         bcrypt.compare(adminData.Password,admin.Password).then((status)=>{
            if(status)
            {
              console.log("login successful")
              response.admin=admin
              response.status=true
              resolve(response)
            }
            else
            {
              console.log("login failed")
              resolve({status:false})
            }
         })
       }else
       {
         console.log("login failed")
         resolve({status:false})
       }
     })
   },
   getDealerDetails:(dealerId)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.DEALERS_COLLECTION).findOne({_id:objectId(dealerId)}).then((dealer=>{
        
        resolve(dealer)
      }))
    })
  },
   getProducts:()=>{
     return new Promise(async (resolve,reject)=>{
        let noofproducts=await db.get().collection(collection.PRODUCTS_COLLECTION).countDocuments()
        resolve(noofproducts)
     })
   },
   getUsers:()=>{
    return new Promise(async (resolve,reject)=>{
       let noofusers=await db.get().collection(collection.USER_COLLECTION).countDocuments()
       resolve(noofusers)
    })
  },
  getDealers:()=>{
    return new Promise(async (resolve,reject)=>{
       let noofdealers=await db.get().collection(collection.DEALERS_COLLECTION).countDocuments()
       resolve(noofdealers)
    })
  },
  getOrders:()=>{
    return new Promise(async (resolve,reject)=>{
      let nooforders=await db.get().collection(collection.ORDER_COLLECTION).countDocuments()
      resolve(nooforders)
    })
  },
 
};
