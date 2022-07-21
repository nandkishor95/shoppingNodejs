const jwt = require ("jsonwebtoken");
const usedata = require("../Model/user");
require("dotenv").config();

exports.verify = async (req,res,next) =>{
    try {
        let token = req.headers.authorization.split(" ")[1];
         const {userId} = jwt.verify(token, process.env.Secretkey);
         
         req.user = userId;
         next();
    } catch (error) {
        res.send({responseCode:"409", responseMessage:"Unauthorized User"})
    }
}

exports.verifyAdmin = async (req,res,next) =>{
    const userId = req.user;
    let user = await usedata.findById({_id:userId});
    if(user.Role == "admin" || user.Role == "Admin"){
        next();
    }else{
        return res.send({responseCode:409, responseMessage:"Only Admin has Access"})
    }
    console.log(user);
    
}