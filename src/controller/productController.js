const productModel = require("../model/productModel");
const mongoose = require("mongoose");


const isValidRequestBody = function (requestBody) {
    if (!requestBody) return false;
    if (Object.keys(requestBody).length == 0) return false;
    return true;
};

const isValidData = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length == 0) return false;
    return true;
};
isvalidString=function (value) {
    if (typeof value === "string" && value.trim().length == 0) return false;
    return true;
};
//============================= getProductById ==============================================
const getProductById = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Please add The Valid productId" })
        }

        const findInDB = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!findInDB) {
            return res.status(404).send({ status: false, message: "product is not available" })
        }
        if (findInDB.isDeleted == false) {
            findInDB.deletedAt = null;
        }

        return res.status(200).send({ status: true, message: 'Success', data: findInDB })

    } catch (err) {
        console.log("This is the error :", err.message);
        res.status(500).send({ msg: "Error", error: err.message });
    }

}


//----------------------------------------updateProductDetails---------------------------------------------------//
const updateProductDetail = async function (req, res) {

    try {
        const updatedData = req.body
        const productId = req.params.productId
        let files = req.files;

        // aws upload
        
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0]);
            data.productImage = uploadedFileURL;
          }

        if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: 'productId is not valid' })

        const cheakProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!cheakProduct) { return res.status(404).send({ status: false, message: "product not found" }) }

        if (!updatedData) { return res.status(400).send({ status: false, message: "Put something what you want to update." }) }

        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage } = updatedData
        //-------validate titel -------
        // if (!isValidData(title) || title.length == 0) {
        //     return res.status(400).send({ status: false, msg: `Heyyy....! put somwthimg in the titel` });
        // }
            if (title) {
                if (!isValidData(title) || title.length == 0) {
                    return res.status(400).send({ status: false, msg: `Heyyy....! put somwthimg in the titel` });
                }
                console.log(typeof title)
                
            if (!/^\s*[a-zA-Z0-9 ]{2,}\s*$/.test(title)) {
                return res.status(400).send({ status: false, msg: `Heyyy....! ${title} is not a valid title` });
            }

        }
        //-------finding the titel from db-------
        if (title) {

            const checkTitle = await productModel.findOne({ title: title });

            if (checkTitle) {
                return res.status(400).send({ status: false, message: ` Title is already used` })
            }
        }
        //------- description-------
        // if (!isValidData(description)) {
        //     return res.status(400).send({ status: false, msg: `Heyyy....! put somwthimg in the description` });
        // }
        if (description) {
            
            if (!isValidData(description)) {
                return res.status(400).send({ status: false, msg: `Description is required` });
            }
        }
        //------- Validate price-------

        if (price) {

            if (isNaN(Number(price))) {
                return res.status(400).send({ status: false, message: `Price should be a valid number` })
            }
            if (price <= 0) {
                return res.status(400).send({ status: false, message: `Price should be a valid number` })
            }
        }
        //-------  currencyId-------

        if (currencyId) {
            if (!isValidData(currencyId)) {
                return res.status(400).send({ status: false, message: `currencyId is required` })
            }
            if (currencyId != "INR") {
                return res.status(400).send({ status: false, message: 'currencyId should be a INR' })
            }
        }
        //---------  currencyFormat-------       
        
        if (currencyFormat) {
            if (!isValidData(currencyFormat)) {
                return res.status(400).send({ status: false, message: `currency format is required` })
            }
            if (currencyFormat != "₹") {
                return res.status(400).send({ status: false, message: "Please provide currencyFormat in format ₹ only" })
            }
        }
        //---------  isFreeShipping------- 
      
        if (isFreeShipping) {
            if (!isValidData(isFreeShipping)) {
                return res.status(400).send({ status: false, message: `isFreeshiping is required` })
            }

            if (!((isFreeShipping === "true") || (isFreeShipping === "false"))) {
                return res.status(400).send({ status: false, message: 'isFreeShipping should be a boolean value' })
            }
        }
        //---------  validate ProductImage-------

       
        if (productImage) {
            if (!isValidData(productImage)) {
                return res.status(400).send({ status: false, message: `(productImageis required` })
            }
            if (!/([/|.|\w|\s|-])*\.(?:jpg|jpeg|png|JPG|JPEG|PNG)/.test(productImage)) return res.status(400).send({ status: false, message: " productImage is not in right format .." })
          }

        //---------  style-------  
        // if (!isvalidString(style)) {
        //     return res.status(400).send({ status: false, msg: `Heyyy....! style is required` });
        // }
        //---------  availableSizes------- 
        // if (!isValidData(availableSizes)) {
        //     return res.status(400).send({ status: false, message: `size is required` })
        // }

        if (availableSizes) {
            if (!isValidData(availableSizes)) {
                return res.status(400).send({ status: false, message: `size is required` })
            }
    
            let sizes = availableSizes.split(",").map(x => x.trim())
            console.log(sizes)
            sizes.forEach((size) => {
                if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size)) {
                    return res.status(400).send({ status: false, msg: `Available sizes must be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
                }
            })
        }
        //---------  installments-------        
      
        if (installments) {
            if (!isValidData(installments)) {
                return res.status(400).send({ status: false, message: `installment is required` })
            }

            if (!Number.isInteger(Number(installments))) {
                return res.status(400).send({ status: false, message: `installments should be a valid number` })
            }
        }

        const updatedProduct = await productModel.findOneAndUpdate({ _id: productId }, updatedData, { new: true })

        { return res.status(200).send({ status: true, message: 'Product details updated successfully.', data: updatedProduct }); }


    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { getProductById, updateProductDetail };