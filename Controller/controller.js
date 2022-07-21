const usedata = require("../Model/user");
const productdata = require("../Model/productdata");
const bcrypt = require('bcrypt');
const validator = require('email-validator');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const otpgenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const { Buy } = require("../Model/buy");

let GenerateOtp = otpgenerator.generate(4, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
});


// Sign In Api
const SignIn = async (req, res) => {
    const { name, email, password, role, mobile, amount } = req.body;
    let roleid;
    if (name && email && password && role && mobile && amount) {
        if (validator.validate(email)) {
            let user = await usedata.findOne({ Email: email });
            if (user) {
                res.send("Email dosn't exist");
            } else {
                if (role == "Admin" || role == "admin") {
                    roleid = 1;
                } else if (role == "User" || role == "user") {
                    roleid = 2;
                }
                if (roleid) {
                    if (roleid === 1) {
                        let Admin = await usedata.findOne({ RoleId: roleid });
                        if (Admin) {
                            return res.send("Admin Is already Exists ,You Cant Set Role as Admin");
                        }
                    }
                    try {
                        let salt = await bcrypt.genSalt(10);
                        let hashpassword = await bcrypt.hash(password, salt);

                        const data = new usedata({
                            Name: name,
                            Email: email,
                            Password: hashpassword,
                            Role: role,
                            RoleId: roleid,
                            Mobile: mobile,
                            Amount: amount
                        });
                        const insertdata = await data.save();
                        res.send(insertdata);
                        const transferemail = nodemailer.createTransport({
                            service: "gmail",
                            auth: {
                                user: "desainandu372@gmail.com",
                                pass: "fwsteyufzgrgrdmw",
                            },
                        });
                        const mysendmaildataobj = {
                            from: "desainandu372@gmail.com",
                            to: email,
                            subject: "Register Successfully",
                            text: `Your Data Register Successfully`,
                        };
                        transferemail.sendMail(mysendmaildataobj, (error) => {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log("Mail send Succesfully!");
                                res.send("Registeration Successful");
                            }
                        });
                    } catch (error) {
                        res.send(error);
                    }
                } else {
                    res.send("Please enter valid role");
                }

            }
        } else {
            res.send("Invalid email, please enter valid email");
        }
    } else {
        res.send("All fields are required");
    }
};

// Log In Api
const LogIn = async (req, res) => {
    const { email, password } = req.body;
    if (email && password) {
        if (validator.validate(email)) {
            let user = await usedata.findOne({ Email: email });
            if (user) {
                let check = await bcrypt.compare(password, user.Password);
                if (check) {
                    let token = jwt.sign({ userId: user._id }, process.env.Secretkey, {
                        expiresIn: "15m",
                    });
                    res
                        .status(200)
                        .json({ status: "Login Successful", "Your Token": token });
                } else {
                    res.send("Password not correct");
                }
            } else {
                res.send("Email not match");
            }
        } else {
            res.send("Invalid email, please enter valid email");
        }
    } else {
        res.send("All fields required");
    }
};

//buyApi
//buyproduct
const BuyProduct = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const user = await usedata.findOne({ _id: userId });
        if (!user) {
            res.status(400).send({ status: "error", message: "User not found" });
        }
        const product = await productdata.findOne({ _id: productId });
        if (!product) {
            res.status(400).send({ status: "error", message: "Product not found" });
        }
        var availableBalance = Number(user.Amount) - Number(product.ProductPrize);
        if (availableBalance < 0) {
            res.status(400).send({ status: "error", message: "Available Balance not sufficient." });
        }
        const BuyProduct = new Buy(req.body);
        const insertdata = await BuyProduct.save()
        res.send(insertdata);
        let userdata = await usedata.findByIdAndUpdate({ _id: userId }, { $set: { Amount: availableBalance } });
        if (userdata) {
            const transferemail = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "desainandu372@gmail.com",
                    pass: "fwsteyufzgrgrdmw",
                },
            });
            const mysendmaildataobj = {
                from: "desainandu372@gmail.com",
                to: user.Email,
                subject: "Dmart",
                text: " Sucessfully Buy Product - (" + product.ProductName + ")",
            };
            transferemail.sendMail(mysendmaildataobj, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email Sent" + info.res);
                    res.status(200).send({ status: "success", message: "Successfully buy product " + product.ProductName });
                }
            });
        } else {
            res.send("not avilable balance");
        }
        //     .then(() => {
        //     usedata.findOneAndUpdate({ _id: userId }, { $set: { Amount: availableBalance } }).then(() => {
        //         var mailOption = {
        //             from: "desainandu372@gmail.com",
        //             to: user.Email,
        //             subject: "Lencecart",
        //             text: " Sucessfully Buy Product - (" + product.ProductName + ")",
        //         };
        //         transport.sendMail(mailOption, function (err, info) {
        //             if (err) {

        //             } else {
        //                 console.log("Email Sent" + info.res);
        //                 res.status(200).send({ status: "success", message: "Successfully buy product " + product.ProductName });
        //             }
        //         });
        //     }).catch((err) => {
        //         res.status(400).send({ status: "error", message: err });
        //     })
        // })
        // .catch((error) => {
        //     console.log(error);
        // });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message })
    }
};
// See All Products
const viewProducts = async (req, res) => {
    try {
        let result = await productdata.find();
        res.send(result);
    } catch (error) {
        res.send(error);
    }
};

// StoreProduct 
const StoreProduct = async (req, res) => {
    const { productid, productName, productPrize, quantityOfProduct } = req.body;

    const addProduct = new productdata({
        ProductID: productid,
        ProductName: productName,
        ProductPrize: productPrize,
        QuantityOfProduct: quantityOfProduct
    });
    var saveproducts = await addProduct.save();
    res.send(saveproducts);
};


//searching
const Search = async (req, res) => {
    try {
        var regex = new RegExp(req.params.productName, 'i');
        const result = await productdata.find({ ProductName: regex });

        if (result == 0) {
            res.send("Record not found");
        } else {
            res.send(result);
        }
    } catch (error) {
        console.log(error);
    }

};


//Sorting
const SortingAsc = async (req, res) => {
    try {
        const records = await productdata.find({}).sort({ ProductID: 1 });
        res.status(200).json({ "total": records.length, records })
    } catch (error) {
        res.send(error)
    }
};

const SortingDesc = async (req, res) => {
    try {
        const records = await productdata.find({}).sort({ ProductID: -1 });
        res.status(200).json({ "total": records.length, records })
    } catch (error) {
        res.send(error)
    }
};

// Paginate API
const Pagination = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const data = await productdata.find().limit(limit * 1).skip((page - 1) * limit);
        res.send(data);
    } catch (error) {
        console.log(error);
        res.send(error)
    }
};

//Sent Email Notification
const sentemailNotification = async (req, res) => {
    const { email, role } = req.body;
    if (email && role) {
        if (validator.validate(email)) {
            let user = await usedata.findOne({ Email: email });
            let useremail = user.Email;
            if (useremail) {
                let user = await usedata.findOne({ Role: role });
                let userrole = user.Role;
                if (userrole) {
                    const transferemail = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: "desainandu372@gmail.com",
                            pass: "fwsteyufzgrgrdmw",
                        },
                    });
                    const mysendmaildataobj = {
                        from: "desainandu372@gmail.com",
                        to: useremail,
                        subject: "notification mail",
                        text: ` Your product avilable on store ${userrole} `,
                    };
                    transferemail.sendMail(mysendmaildataobj, (error) => {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log("Mail send Succesfully!");
                            res.send("Mail send Succesfully!");
                        }
                    });
                } else {
                    res.send("job role not match");
                }
            } else {
                res.send("email not match");
            }
        } else {
            res.send("Invalid email, please enter valid email");
        }
    } else {
        res.send("All fields are required");
    }
};

// SentOtp Api
const sendotp = async (req, res) => {
    const transferemail = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "desainandu372@gmail.com",
            pass: "fwsteyufzgrgrdmw",
        },
    });
    const mysendmaildataobj = {
        from: "desainandu372@gmail.com",
        to: "nandkishordesai95@gmail.com",
        subject: "Generated OTP",
        text: `${GenerateOtp}`,
    };
    transferemail.sendMail(mysendmaildataobj, (error) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Mail send Succesfully!");
            res.send("Oto sent successfully");
        }
    });
};


//Add New Product 
const AddNewProduct = async (req, res) => {
    const { productid, productName, productPrize, quantityOfProduct } = req.body;

    if (productid && productName && productPrize && quantityOfProduct) {
        const addProduct = new productdata({
            ProductID: productid,
            ProductName: productName,
            ProductPrize: productPrize,
            QuantityOfProduct: quantityOfProduct
        });
        var saveproducts = await addProduct.save();
        res.send(saveproducts);
    } else {
        res.send("All fields are required");
    }
};


//Delete Product
const DeletedData = async (req, res) => {
    const { productid } = req.body;
    if (productid) {
        let user = await productdata.findOne({ productID: productid });
        if (user) {
            try {
                await productdata.findByIdAndDelete(user._id)
                res.send("Deleted Successfully");
            } catch (error) {
                res.send(error);
            }
        } else {
            res.send("product Id is not found");
        }
    } else {
        res.send("All fields are required");
    }
};

// Update product
const UpdateProduct = async (req, res) => {
    const { productid, productName } = req.body;
    if (productid && productName) {
        let user = await productdata.findOne({ ProductID: productid });
        if (user) {
            try {
                await productdata.findByIdAndUpdate(user._id, {
                    $set: { ProductName: productName },
                });
                res.send("Product added successfully");
            } catch (error) {
                res.send(error);
            }
        } else {
            res.send("product Id is not found");
        }
    } else {
        res.send("All fields are required");
    }
};


//Add Amount
const updateAmount = async (req, res) => {
    const { email, addAmount } = req.body;
    if (email && addAmount) {
        let user = await usedata.findOne({ Email: email });
        if (user) {
            let totalAmount = user.Amount + addAmount;
            await usedata.findByIdAndUpdate(
                { _id: user._id },
                { $set: { Amount: totalAmount } }
            );
            res.status(200).json({ message: "Amount credited Successfully" });
        } else {
            res.status(400).json({ message: "Your Email does not exists" });
        }
    } else {
        res.status(400).json({
            message: "Enter your valid email and Amount",
        });
    }
};

//Debit Amount
const debitAmount = async (req, res) => {
    const { email, debitAmount } = req.body;
    if (email && debitAmount) {
        let user = await usedata.findOne({ Email: email });
        if (user) {
            let totalAmount = user.Amount - debitAmount;
            await usedata.findByIdAndUpdate(
                { _id: user._id },
                { $set: { Amount: totalAmount } }
            );
            res.status(200).json({ message: "Amount debited Successfully" });
        } else {
            res.status(400).json({ message: "Your Email does not exists" });
        }
    } else {
        res.status(400).json({
            message: "Enter your valid email and Amount",
        });
    }
};


module.exports = {
    SignIn, LogIn, viewProducts, StoreProduct, Search, SortingAsc, SortingDesc, Pagination,
    sentemailNotification, sendotp, AddNewProduct, DeletedData, UpdateProduct, updateAmount, debitAmount, BuyProduct
};