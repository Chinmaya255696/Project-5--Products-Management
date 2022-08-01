const { default: mongoose } = require("mongoose");
let cartModel =require("../model/cartModel")
const userModel = require("../model/userModel");
const createCart = async (req, res) => {
    try {
        const userId = req.params.userId
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please add The Valid userId" })
        }
        var data = req.body;
        if (!Object.keys(data).length) return res.status(400).send({ status: false, message: "body is Required.." })

        const uniqueUser = await cartModel.findOne({ userId: userId })
        if (uniqueUser) {
            const { items, cartId } = data
            if (!mongoose.isValidObjectId(cartId)) {
                return res.status(400).send({ status: false, message: "Please add The Valid cartId" })
            }
            if (!cartId) return res.status(400).send({ status: false, message: "Please add cartId in reqbody as user have cart already" })
            let totalprice = 0
            let array = []
            let quantity = []
            for (let i = 0; i < items.length; i++) {
                if (!mongoose.isValidObjectId(items[i].productId)) {
                    return res.status(400).send({ status: false, message: "Please add The Valid productId" })
                }
                array.push(items[i].productId)
                if (!/^([1-9]\d*)$/.test(items[i].quantity)) return res.status(400).send({ status: false, message: "enter valid quantity" })
                quantity.push(items[i].quantity)
            }

            let products = await productModel.find({ _id: { $in: array } }, { isDeleted: false })
            if (products.length == 0) return res.status(400).send({ status: false, message: "add products in cart" })
            for (let i = 0; i < items.length; i++) {
                totalprice += products[i].price * quantity[i]
            }
            //console.log(totalprice)

            data.totalPrice = totalprice
            data.totalItems = items.length
            //   console.log(data)
            const saveData = await cartModel.findOneAndUpdate({ _id: cartId }, data, { new: true })
            //console.log(saveData)
            res.status(200).send({ status: true, message: "Cart updated Successfully", data: saveData })

        }
        else {
            const { items } = data
            data.userId = userId
            let totalprice = 0
            let array = []
            let quantity = []
            for (let i = 0; i < items.length; i++) {
                if (!mongoose.isValidObjectId(items[i].productId)) {
                    return res.status(400).send({ status: false, message: "Please add The Valid productId" })
                }
                array.push(items[i].productId)
                if (!/^([1-9]\d*)$/.test(items[i].quantity)) return res.status(400).send({ status: false, message: "enter valid quantity" })
                quantity.push(items[i].quantity)
            }

            let products = await productModel.find({ _id: { $in: array } }, { isDeleted: false })
            if (products.length == 0) return res.status(400).send({ status: false, message: "add products in cart" })
            for (let i = 0; i < items.length; i++) {
                totalprice += products[i].price * quantity[i]
            }
            //console.log(totalprice)

            data.totalPrice = totalprice
            data.totalItems = items.length


            const saveData = await cartModel.create(data)
            //console.log(saveData)
            res.status(201).send({ status: true, message: "Cart created Successfully", data: saveData })
        }
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })


    }
}
// ### GET /users/:userId/cart
// - Returns cart summary of the user.
// - Make sure that cart exist.
// - Make sure the userId in params and in JWT token match.
// - Make sure the user exist
// - Get product(s) details in response body.
// - __Response format__
//   - _**On success**_ - Return HTTP status 200. Return the cart document. The response should be a JSON object like [this](#successful-response-structure)
//   - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

const getCart = async function(req,res){
    try {
        const userId = req.params.userId;
 

       if( !mongoose.isValidObjectId(userId)){
        return req.status(400).send({status: false, message: "Please add The Valid UserID" })
       }
       let findUser = await userModel.findOne({_id:userId})
       if(!findUser){return res.status(404).send({status:false,message:" User not Found"})}
       
    if(findUser._id != userId){return res.status(403).send({status:false,message:"you are not Authorised"})}

      

       let  checkCart = await cartModel.findOne({ userId:userId })
       console.log(checkCart)
       if(!checkCart){return res.status(404).send({status:false,message:" cart not Found"})}

       return res.status(200).send({status:true,message:"succsefully fetched Cart", data:checkCart})
        
    } catch (error) {
        return req.status(500).send({status:false,message:error.message})
    }
}

// ### DELETE /users/:userId/cart
// - Deletes the cart for the user.
// - Make sure that cart exist.
// - Make sure the userId in params and in JWT token match.
// - Make sure the user exist
// - cart deleting means array of items is empty, totalItems is 0, totalPrice is 0.
// - __Response format__
//   - _**On success**_ - Return HTTP status 204. Return a suitable message. The response should be a JSON object like [this](#successful-response-structure)
//   - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)


const deleteCart = async function(req,res){
    try {
        const userId = req.params.userId;
 

        if( !mongoose.isValidObjectId(userId)){
         return req.status(400).send({status: false, message: "Please add The Valid UserID" })
        }
        let findUser = await userModel.findOne({_id:userId})
        if(!findUser){return res.status(404).send({status:false,message:" User Already deleted"})}

        if(findUser._id != userId){return res.status(403).send({status:false,message:"you are not Authorised"})}

        let checkCart = await cartModel.findOne({ userId:userId })
        console.log(checkCart)
        if(!checkCart){return res.status(404).send({status:false,message:" cart not Found"})}

        let deleteCartItems = await cartModel.findOneAndUpdate({ userId:userId }, {$set:{items:[],totalPrice:0,totalItems:0}})

        return res.status(200).send({status:true, message:"Cart deleted successfully", data:deleteCartItems})



    } catch (error) {
        return req.status(500).send({status:false,message:error.message})
    }
}


module.exports={createCart,getCart,deleteCart} 