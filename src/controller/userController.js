const userModel = require("../model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const aws = require("aws-sdk");
const multer = require("multer")

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
const isValidObjectId = function (objectId) {
  if (mongoose.Types.ObjectId.isValid(objectId)) return true;
  return false;
};
aws.config.update({
  accessKeyId: "AKIAY3L35MCRVFM24Q7U",
  secretAccessKey: "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",
  region: "ap-south-1",
});

let uploadFile = async (file) => {
  return new Promise(function (resolve, reject) {
    let s3 = new aws.S3({ apiVersion: "2006-03-01" }); // we will be using the s3 service of aws

    var uploadParams = {
      ACL: "public-read",
      Bucket: "classroom-training-bucket", //HERE
      Key: "abc/" + file.originalname, //HERE
      Body: file.buffer,
    };

    s3.upload(uploadParams, function (err, data) {
      if (err) {
        return reject({ error: err });
      }
      // console.log(data)
      console.log("file uploaded succesfully");
      return resolve(data.Location);
    });
  });
};

// ------------------------------------------------creatUser-----------------------------------------------------------------//
const createUser = async function (req, res) {
  try {
    let data = req.body;

    const { fname, lname, email, phone, password } = data;

    data.address = JSON.parse(data.address);

    let files = req.files;

    if (!isValidRequestBody(data)) {
      return res
        .status(400)
        .send({ status: false, msg: "Body cannot be empty" });
    }
    if (!isValidData(fname)) {
      return res
        .status(400)
        .send({ status: false, msg: "please enter your good Name" });
    }
    if (!/^\s*[a-zA-Z]{2,}\s*$/.test(fname)) {
      return res.status(400).send({
        status: false,
        msg: `Heyyy....! ${fname} is not a valid first name`,
      });
    }
    data.fname = fname;

    if (!isValidData(lname)) {
      return res
        .status(400)
        .send({ status: false, msg: "please enter your last Name" });
    }
    if (!/^\s*[a-zA-Z]{2,}\s*$/.test(lname)) {
      return res.status(400).send({
        status: false,
        msg: `Heyyy....! ${lname} is not a valid  last name`,
      });
    }
    data.lname = lname;
    if (!isValidData(email)) {
      return res.status(400).send({ status: false, msg: "please enter email" });
    }
    if (
      !/^\s*[a-zA-Z0-9]+([\.\_\-][a-zA-Z0-9]+)@[a-z]+([\.\_\-][a-zA-Z0-9]+)\.[a-z]{2,3}\s*$/.test(
        email
      )
    ) {
      return res
        .status(400)
        .send({
          status: false,
          msg: `Heyyy....! ${email} is not a valid email`,
        });
    }

    data.email = email;

    let fileData = files[0];

    if (!/([/|.|\w|\s|-])*\.(?:jpg|jpeg|png)/.test(fileData.originalname)) {
      return res
        .status(400)
        .send({ status: false, msg: "please Add your profile Image" });
    }

    if (files && files.length > 0) {
      let uploadedFileURL = await uploadFile(files[0]);
      data.profileImage = uploadedFileURL;
    } else {
      res.status(400).send({ msg: "No file found" });
    }

    if (!isValidData(phone)) {
      return res
        .status(400)
        .send({ status: false, msg: "please enter your mobile number" });
    }
    if (!/^\s*(?=[6789])[0-9]{10}\s*$/.test(phone)) {
      return res
        .status(400)
        .send({
          status: false,
          msg: `Heyyy....! ${phone} is not a valid phone`,
        });
    }
    data.phone = phone;

    if (!isValidData(password)) {
      return res.status(400).send({
        status: false,
        msg: "please enter Password....!",
      });
    }
    if (!/^[a-zA-Z0-9@*&]{8,15}$/.test(password)) {
      return res.status(400).send({
        status: false,
        msg: "please please enter valid password max 8 or min 15 digit",
      });
    }
    //hashing
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);
    data.password = hash;
    if (
      !isValidData(data.address.shipping.street) ||
      !/^([a-zA-Z 0-9\S]+)$/.test(data.address.shipping.street)
    ) {
      return res
        .status(400)
        .send({ status: false, msg: "please add valid street" });
    }

    if (
      !isValidData(data.address.shipping.city) ||
      !/^([a-zA-Z]+)$/.test(data.address.shipping.city)
    ) {
      return res
        .status(400)
        .send({ status: false, msg: "please add valid city" });
    }

    if (
      !isValidData(data.address.shipping.pincode) ||
      !/^[1-9]{1}[0-9]{2}[0-9]{3}$/.test(data.address.shipping.pincode)
    ) {
      return res
        .status(400)
        .send({ status: false, msg: "please add valid pincode" });
    }

    if (
      !isValidData(data.address.billing.street) ||
      !/^([a-zA-Z 0-9\S]+)$/.test(data.address.billing.street)
    ) {
      return res
        .status(400)
        .send({ status: false, msg: "please add valid street" });
    }

    if (
      !isValidData(data.address.billing.city) ||
      !/^([a-zA-Z]+)$/.test(data.address.billing.city)
    ) {
      return res
        .status(400)
        .send({ status: false, msg: "please add valid city" });
    }

    if (
      !isValidData(data.address.billing.pincode) ||
      !/^[1-9]{1}[0-9]{2}[0-9]{3}$/.test(data.address.billing.pincode)
    ) {
      return res
        .status(400)
        .send({ status: false, msg: "please add valid pincode" });
    }

    let crateUserDoc = await userModel.create(data);
    return res.status(201).send({
      status: true,
      message: "User created Success",
      data: crateUserDoc,
    });
  } catch (err) {
    console.log("This is the error :", err.message);
    res.status(500).send({ msg: "Error", error: err.message });
  }
};

// --------------------------------------------loginUser-----------------------------------------------------------------//
let loginUser = async function (req, res) {
  try {
    let data = req.body;
    let email1 = data.email;
    let password1 = data.password;

    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide details in body" });
    }
    if (!email1 || email1.trim().length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide Email" });
    }
    if (!password1 || password1.trim().length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide Password" });
    }
    if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email1)) {
      return res.status(400).send({
        status: false,
        message: "Email should be valid email address",
      });
    }
    if (!/^.{8,15}$/.test(password1)) {
      return res.status(400).send({
        status: false,
        message: "password length should be in between 8 to 15",
      });
    }
    let userData = await userModel.findOne({ email: email1 });
    console.log(userData);
    if (!userData) {
      return res.status(400).send({
        status: false,
        message: "Email or the Password doesn't match",
      });
    }
    const checkPassword = await bcrypt.compare(password1, userData.password);

    if (!checkPassword)
      return res.status(401).send({
        status: false,
        message: `Login failed!! password is incorrect.`,
      });
    let userId = userData._id;
    let token = jwt.sign(
      {
        userId: userId,

        iat: Math.floor(Date.now() / 1000), //1sec=1000ms, date.now return times in milliseconds.
        exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
      },
      "group71-project5"
    );

    {
      res.status(200).send({
        status: true,
        message: "User login successfull",
        data: { userId: userId, Token: token },
      });
    }
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

// ------------------------------------------------getUser-----------------------------------------------------------------//
const getUser = async function (req, res) {
  try {
    let userId = req.params.userId;
    //console.log(userId)
    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: " enter valid bookId" });
    }
    const getUser = await userModel.findOne({ _id: userId });

    if (!getUser) {
      return res.status(404).send({ status: false, message: "no User found" });
    }
    res
      .status(200)
      .send({ status: true, message: "User profile details", data: getUser });
  } catch (err) {
    console.log("This is the error :", err.message);
    res.status(500).send({ msg: "Error", error: err.message });
  }
};

module.exports = { createUser, loginUser, getUser };
