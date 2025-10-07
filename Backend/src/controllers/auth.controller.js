const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {
    const { fullName: { firstName, lastName }, email, password } = req.body;

    
    const isUserAlreadyExists = await userModel.findOne({ email });

    
    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "User already exists"
        });
    }

    // 3. If they DON'T exist, hash the password and create the user
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
        fullName: {
            firstName,
            lastName
        },
        email,
        password: hashPassword
    });

    // 4. Now that the user is created, generate a token and send a success response
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token);
    res.status(201).json({
        message: "User registered successfully",
        user: {
            email: user.email,
            _id: user._id,
            fullName: user.fullName
        }
    });
}

async function loginUser(req, res) {
    const { email, password } = req.body;
    const user = await userModel.findOne({
        email
    });

    if (!user) {
        return res.status(400).json({
            message: "User not found"
        });
    }

   
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }

    const token = jwt.sign({id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token);
    res.status(200).json({
        message: "User logged in successfully",
        user: {
            email: user.email,
            _id: user._id,
            fullName: user.fullName
        }
    });
}
async function logoutUser(req, res) {
    res.clearCookie('token');
    res.status(200).json({ message: 'User logged out successfully' });
};
async function getCurrentUser(req, res) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        res.status(200).json({ user });
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
}
module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser

};