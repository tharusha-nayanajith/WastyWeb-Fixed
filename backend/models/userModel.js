// userModel.js
const mongoose = require("mongoose");
const { default: isEmail } = require("validator/lib/isemail");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please add a full name"],
    },
    contactNumber: {
      type: Number,
      required: [true, "Please add a Contact number"],
      minlength: [10, "please enter only 10 characters"],
      maxlength: [10, "please enter only characters"],
    },
    username: {
      type: String,
      required: [true, "Please add an username"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      validate: [isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "please enter more than 6 characters"],
    },
    role: {
      type: String,
      enum: ["Admin", "Collector", "Customer"],
      required: true,
      default: "Customer", // Default role is Customer
    },
    Id: {
      type: String,
      required: true,
    },
      // 🔒 Add these fields
      failedLoginAttempts: { type: Number, default: 0 },
      lockUntil: { type: Date, default: null },

  },
  {
    timestamps: true,
  }
);
// 🔒 Virtual helper
userSchema.virtual("isLocked").get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});


const User = mongoose.model("User", userSchema);

module.exports = User;
