const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const nodemailer = require("nodemailer");

require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.signup = async (req, res, next) => {
  const baseRole = req.baseUrl.split("/")[1];
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: errors.array() });
    }

    const { email, name, password } = req.body;
    const role = baseRole;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      throw new Error('Email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ email, password: hashedPassword, name, role });

    res.status(201).json({
      message: 'User Created!',
      userId: user.id,
      role: user.role,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_ID,
      to: email,
      subject: 'Welcome to EcommerceSite',
      html: 'Successful signup',
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const baseRole = req.baseUrl.split("/")[1];
  try {
    const { email, password } = req.body;
    let user;
    if (baseRole === "user") {
      user = await User.findOne({ where: { email } });
    }
    if (!user) {
      throw new Error("A user with this email could not be found.");
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error("Wrong Password.");
    }

    const token = jwt.sign(
      {
        userId: user.id.toString(),
        role: user.role,
      },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      token,
      userId: user.id.toString(),
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  const baseRole = req.baseUrl.split("/")[1];
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: errors.array() });
    }

    const { oldpassword, newpassword } = req.body;
    let user;
    if (baseRole === "user") {
      user = await User.findByPk(req.userId);
    }
    if (!user) {
      throw new Error("A user with this email could not be found.");
    }

    const isEqual = await bcrypt.compare(oldpassword, user.password);
    if (!isEqual) {
      throw new Error("Your old Password is incorrect.");
    }

    const hashedPassword = await bcrypt.hash(newpassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password Updated Successfully",
    });
  } catch (err) {
    next(err);
  }
};
