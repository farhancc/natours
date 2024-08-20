const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userschema = new mongoose.Schema({
  name: { type: String, require: [true, 'you should have a name '] },
  email: {
    type: String,
    required: [true, 'email is mandatory'],
    unique: [true, 'already signed up'],
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  photo: { type: String, default: 'default.jpg' },

  password: {
    type: String,
    required: [true, 'please provide a psswrd'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      // this work only on SAVE and CREATE not find one and update
      validator: function (el) {
        return el === this.password;
      },
      message: 'type same password as above',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userschema.pre('save', async function (next) {
  // only run if modify pasword
  if (!this.isModified('password')) {
    return next();
  }
  //hash the password before store indb
  this.password = await bcrypt.hash(this.password, 12);
  // pswrd confirm only need for validation and no longer needed since it is a required filed set to undifined
  this.passwordConfirm = undefined;
  next();
});

userschema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userschema.pre(/^find/, function (next) {
  // this point to current query
  this.find({ active: { $ne: false } });
  next();
});

userschema.methods.correctPassword = async function (
  candidatepassword,
  userpassword
) {
  return await bcrypt.compare(candidatepassword, userpassword);
};
userschema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // the password changed at is in date format we need to convert it to Jwt time stamp format to compare
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(this.passwordChangedAt, changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userschema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 10 * 1000;
  console.log(resetToken, 'reset token', this.passwordResetToken);
  return resetToken;
};
const User = mongoose.model('User', userschema);
module.exports = User;
