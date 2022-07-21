const express = require('express');
const router = express.Router();
const usecontrol = require("../Controller/controller");
const usemiddleware = require("../Middleware/middleware");

const cloudinary = require("../UtilCloud/cloudinary");
const upload = require("../UtilCloud/multer");


router.post("/Sign", usecontrol.SignIn);
router.post("/LogIn", usecontrol.LogIn);

router.get("/viewproduct", usecontrol.viewProducts);
router.post("/productdata", usecontrol.StoreProduct);
router.get("/search/:productName", usecontrol.Search);
router.get("/sorting/asc", usecontrol.SortingAsc);
router.get("/sorting/desc", usecontrol.SortingDesc);
router.post("/paginate", usecontrol.Pagination);
router.post("/emailnotification", usecontrol.sentemailNotification);
router.post("/otpsend", usecontrol.sendotp);
router.post("/buy", usecontrol.BuyProduct);

router.post("/Adddata",usemiddleware.verify, usemiddleware.verifyAdmin, usecontrol.AddNewProduct );
router.put("/updatedata", usemiddleware.verify, usemiddleware.verifyAdmin, usecontrol.UpdateProduct);
router.delete("/deletedata", usemiddleware.verify, usemiddleware.verifyAdmin, usecontrol.DeletedData);

router.put("/amountcredit", usecontrol.updateAmount);
router.put("/debitamount", usecontrol.debitAmount);

router.post("/",upload.single('image') ,async(req, res)=> {
    try {
        const result = await cloudinary.uploader.upload(req.file.path)
        res.json(result)
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;