const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://Nandkishor:Desai123@cluster0.2zi3x.mongodb.net/Alldata?retryWrites=true&w=majority")
.then(()=>{
    console.log("Database Connect Successfully");
}).catch((error)=>{
    console.log(error);
});