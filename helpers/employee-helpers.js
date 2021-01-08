var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId=require('mongodb').ObjectID
const response=require('../app')
module.exports={
    doSignup:(employeeData)=>{
        return new Promise(async(resolve,reject)=>{
          employeeData.Password=await bcrypt.hash(employeeData.Password,10)
          db.get().collection(collection.EMPLOYEE_COLLECTION).insertOne(employeeData).then((data)=>{
              resolve(data.ops[0])
          })
        })   
     
       
      },
      doLogin:(userData)=>{
        return new Promise(async (resolve,reject)=>{
          let loginStatus=false
          let response={}
          let user=await db.get().collection(collection.EMPLOYEE_COLLECTION).findOne({Email:userData.Email})
          if(user)
          {
            bcrypt.compare(userData.Password,user.Password).then((status)=>{
               if(status)
               {
                 console.log("login successful")
                 response.user=user
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
      getAllEmployees:()=>{
        return new Promise(async(resolve,reject)=>{
            let employees=await db.get().collection(collection.EMPLOYEE_COLLECTION).find().toArray()
            resolve(employees)

        })
    },

}