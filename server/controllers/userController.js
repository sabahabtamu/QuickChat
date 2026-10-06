import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const toPublicUser = (user) => {
    const publicUser = user.toObject();
    delete publicUser.password;
    return publicUser;
};

// Signup new user
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;

    try {
        if (!fullName || !email || !password || !bio){
            return res.json({success: false, message: "Missing Details"})
        }
        const user = await User.findOne({email});

        if(user){
            return res.json({success: false, message: "Account already exists"});
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        });

        const token = generateToken(newUser._id)

        return res.json({success: true, userData: toPublicUser(newUser), token, message: "Account created successfully"})
    } catch (error) {
        console.log(error.message)
        return res.json({success: false, message: error.message})
    }
}

// Controller to login a user
export const login = async (req, res) => {
    
    try {
        const {email, password} = req.body
        if(!email || !password){
            return res.json({success: false, message: "Missing Details"});
        }
        const user = await User.findOne({email});
    
        if(!user){
            return res.json({success: false, message: "User doesnot exist"})
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.json({success: false, message: "Incorrect Password"})
        }

        const token = generateToken(user._id);
    
        return res.json({success: true, userData: toPublicUser(user), token, message: "Logged in successfully"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Controller to check if user is authenticated
export const checkAuth = (req, res) => {
    res.json({success: true, user: req.user});
}

// Controller to update user profile details
export const updateProfile = async (req, res) => {
    try {
        const {profilePic, bio, fullName} = req.body;

        const userId = req.user._id;
        let updatedUser;

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true, runValidators: true}).select("-password");
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true, runValidators: true}).select("-password");
        }
        res.json({success: true, user: updatedUser})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}