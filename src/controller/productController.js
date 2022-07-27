const productModel = require("../model/productModel");
const mongoose = require("mongoose");
const aws = require("aws-sdk");

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

        //aws upload

        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0]);
            data.profileImage = uploadedFileURL;
        }

        if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: 'productId is not valid' })

        const cheakProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!cheakProduct) { return res.status(404).send({ status: false, message: "product not found" }) }

        if (!updatedData) { return res.status(400).send({ status: false, message: "Put something what you want to update." }) }

        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage } = updatedData

        if (title) {

            if (!/^\s*[a-zA-Z]{2,}\s*$/.test(title)) {
                return res.status(400).send({ status: false, msg: `Heyyy....! ${title} is not a valid title` });
            }

        }
        if (title) {

            const checkTitle = await productModel.findOne({ title: title });

            if (checkTitle) {
                return res.status(400).send({ status: false, message: ` Title is already used` })
            }
        }

        if (!/^\s*[a-zA-Z]{2,}\s*$/.test(description)) {
            return res.status(400).send({ status: false, msg: `Heyyy....! ${description} is not a description` });
        }
        if (price) {

            if (isNaN(Number(price))) {
                return res.status(400).send({ status: false, message: `Price should be a valid number` })
            }
            if (price <= 0) {
                return res.status(400).send({ status: false, message: `Price should be a valid number` })
            }
        }
        if (!/^\s*[a-zA-Z]{2,}\s*$/.test(currencyId)) {
            return res.status(400).send({ status: false, message: `currencyId is required` })
        }

        if (currencyId) {
            if (currencyId != "INR") {
                return res.status(400).send({ status: false, message: 'currencyId should be a INR' })
            }
        }
        if (!/^\s*[a-zA-Z]{2,}\s*$/.test(currencyFormat)) {
            return res.status(400).send({ status: false, message: `currency format is required` })
        }
        if (currencyFormat) {
            if (currencyFormat != "₹") {
                return res.status(400).send({ status: false, message: "Please provide currencyFormat in format ₹ only" })
            }
        }
        if (isFreeShipping) {

            if (!((isFreeShipping === "true") || (isFreeShipping === "false"))) {
                return res.status(400).send({ status: false, message: 'isFreeShipping should be a boolean value' })
            }
        }
        if (!/^\s*[a-zA-Z]{2,}\s*$/.test(style)) {
            return res.status(400).send({ status: false, msg: `Heyyy....! ${style} is not a valid string` });
        }
        if (!/^\s*[a-zA-Z]{2,}\s*$/.test(availableSizes)) {
            return res.status(400).send({ status: false, message: `size is required` })
        }

        if (availableSizes) {
            let sizes = availableSizes.split(",").map(x => x.trim())
            sizes.forEach((size) => {
                if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size)) {
                    return res.status(400).send({ status: false, msg: `Available sizes must be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
                }
            })
        }
        if (!validator.validString(installments)) {
            return res.status(400).send({ status: false, message: `installment is required` })
        }
        if (installments) {

            if (!Number.isInteger(Number(installments))) {
                return res.status(400).send({ status: false, message: `installments should be a valid number` })
            }}

            const updatedProduct = await productModel.findOneAndUpdate({ _id: productId },updatedData ,{ new: true })
    
        {return res.status(200).send({ status: true, message: 'Product details updated successfully.', data: updatedProduct });}

    
        } catch (error) {
            return res.status(500).send({ status: false, message: error.message })}

//================================= deleteProductById ======================================================
const deleteProductById = async function (req, res) {

    try {
        const productId = req.params.productId

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Please add The Valid productId" })
        }

        const findInDB = await productModel.findById(productId)

        if (!findInDB) {
            return res.status(404).send({ status: false, message: "No such Product with that productId" })
        }

        if (findInDB.isDeleted == true) {
            return res.status(400).send({ status: false, message: "This Product Is already removed" })
        }

        const deleteInDB = await productModel.findByIdAndUpdate({ _id: productId }, { isDeleted: true, deletedAt: Date.now() }, { new: true })

        return res.status(200).send({ status: true, message: "Product removed successfully" })

    } catch (err) {
        console.log("This is the error :", err.message);
        res.status(500).send({ msg: "Error", error: err.message });
    }
}            
        
        module.exports = {getProductById,updateProductDetail,deleteProductById};