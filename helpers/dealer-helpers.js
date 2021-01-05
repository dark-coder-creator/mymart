var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId=require('mongodb').ObjectID
const response=require('../app')
module.exports={
    addDealers: (dealerData) => {
        return new Promise(async (resolve, reject) => {
          dealerData.Password = await bcrypt.hash(dealerData.Password, 10);
          db.get()
            .collection(collection.DEALERS_COLLECTION)
            .insertOne(dealerData)
            .then((data) => {
              resolve(data.ops[0]);
            });
        })
         },
         getAllDealers:()=>{
            return new Promise(async(resolve,reject)=>{
                let dealers=await db.get().collection(collection.DEALERS_COLLECTION).find().toArray()
                resolve(dealers)
    
            })
        },
    
        getAllOrders:()=>{
          return new Promise(async(resolve,reject)=>{
              let orders=await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
              resolve(orders)
  
          })
      },
        getAllUsers:()=>{
          return new Promise(async(resolve,reject)=>{
              let users=await db.get().collection(collection.USER_COLLECTION).find().toArray()
              resolve(users)
  
          })
      },
        doLogin:(adminData)=>{
            return new Promise(async (resolve,reject)=>{
              let loginStatus=false
              let response={}
              let dealer=await db.get().collection(collection.DEALERS_COLLECTION).findOne({Name:adminData.Name})
              console.log(dealer)
              if(dealer)
                 {
                bcrypt.compare(adminData.Password,dealer.Password).then((status)=>{
                   if(status)
                   {
                     console.log("login successful")
                     response.dealer=dealer
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
          deleteDealer:(dealerId)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.DEALERS_COLLECTION).removeOne({_id:objectId(dealerId)}).then((response)=>{
                    console.log(response)
                    resolve(response)
                })
            })
        },
        getUserOrders:(userId)=>{
          return new Promise(async(resolve,reject)=>{
            console.log(userId)
            let orders=await db.get().collection(collection.ORDER_COLLECTION)
               .find({userId:objectId(userId)}).toArray()
                 console.log(orders)
                 resolve(orders)
               
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
    
       getOrders:()=>{
         return new Promise(async (resolve,reject)=>{
           let nooforders=await db.get().collection(collection.ORDER_COLLECTION).countDocuments()
           resolve(nooforders)
         })
       },
       getDealerDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.DEALERS_COLLECTION).findOne({_id:objectId(proId)}).then((product=>{
            
            resolve(product)
          }))
        })
      },
      updateProduct:(dealerId,dealerDetails)=>{
        dealerDetails.Phone=parseInt(dealerDetails.Phone)
         return new Promise((resolve,reject)=>{
           db.get().collection(collection.DEALERS_COLLECTION)
           .updateOne({_id:objectId(dealerId)},{
             $set:{
                 Name:dealerDetails.Name,
                 Password:dealerDetails.Password,
                 Address:dealerDetails.Address,
                 Storename:dealerDetails.Storename,
                 Extrainfo:dealerDetails.Extrainfo,
                 
             }
           }).then((response)=>{
             resolve()
           })
         })
       },
        getDealerProducts:(dealerId)=>{
          return new Promise(async(resolve,reject)=>{
           let details=await db.get().collection(collection.DEALERS_COLLECTION).aggregate([
                  {
                     $match:{dealer:objectId(dealerId)}
                  },
                  {
                    $lookup:{
                      from:collection.PRODUCTS_COLLECTION,
                      localField:'item',
                      foreignField:'_id',
                      as:'product'
                   }
                  }
                ]).toArray();
            resolve(details)
          })
           
        },
      
};