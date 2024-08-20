import User from "../models/User.js";
import Address from "../models/Address.js";
import { encryptData, decryptData } from "../utils/Encryption.js";
import { connectToDatabase } from "./mongodb.js";
import {jwtDecode} from "jwt-decode";

export const createUser = async (req, res) => {
    const { username, email, password,auth_id } = req.body;

    const {db} = await connectToDatabase();
    
    const user = await User.findOne({ auth_id: auth_id });

    if(!user) {
    const newUser = new User({
        username,
        email,
        password: password?password:"",
        auth_id
    });
    await newUser.save();

}

    res.status(201).json({ success: true, data: user });
}

export const getAllUsers = async (req, res) => {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
}

export const getUser = async(req,res)=>{
    const { mobile } = req.body;
    if(!mobile) return res.status(400).json({ success: false, message: "Please add your mobile number" });
    const user = await User.findOne({mobile : mobile});

    res.status(200).json({ success: true, data: user });
}

export const getUserDetails = async(req,res)=>{
    const userId = req.user.id;
    const user = await User.findById(userId).populate('addresses').populate('orders');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const encryptedResponse = encryptData(JSON.stringify(user));
    res.status(200).json({ success: true, data: encryptedResponse });
}


export const updateUserDetails = async (req, res) => {
    const userId = req.user.id;
    const { encryptedData } = req.body;
    const decryptedData = decryptData(encryptedData);
    const parsedData = JSON.parse(decryptedData);
    const { first_name, last_name, mobile } = parsedData;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.first_name = first_name;
    user.last_name = last_name;
    user.mobile = mobile;
    await user.save();
    const encryptedResponse = encryptData(JSON.stringify(user));
    res.status(200).json({ success: true, data: encryptedResponse });
  }