const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const crypto = require('crypto');
const { promisify } = require('util');
// const sendEmail = require('./../utils/email');
const Email = require('../utils/email');

const { token } = require('morgan');
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};
const createSendToken = (user, statusCode, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  const token = signToken(user._id);
  if (process.env.NODE_ENV == 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);

  // Remove password from showing in output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    date: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  const newUser = await User.create({
    name: req.body.name,
    role: req.body.role,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
  // above line replaced by below code
  // const token = signToken(newUser._id);
  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     newUser,
  //   },
  // });
});
exports.login = catchAsync(async (req, res, next) => {
  // const user= await
  const { email, password } = req.body;
  // const password = req.body;
  // check email and password exist
  if (!email || !password) {
    return next(new AppError('enter email and password correctly', 400));
  }
  //check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password'));

  // if everything is ok send token to client
  const token = signToken(user._id);
  res.cookie('token', token, {
    expiresIn: new Date(
      Date.now() + process.env.TOKEN_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    status: 'success',
    token,
  });
});
exports.logout = catchAsync(async (req, res) => {
  res.cookie('token', 'logging out', {
    expiresIn: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
});
exports.protect = catchAsync(async (req, res, next) => {
  // 1) getting the token and check it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return next(
      new AppError('you are not logged in pleas login to get access')
    );
  }
  // console.log(token);
  // 2) token verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);
  // 3) if the user still exists?
  const freshuser = await User.findById(decoded.id);
  if (!freshuser) {
    return next(new AppError('user not exists', 401));
  }
  // 4) check if user changed password after the token was issued
  if (freshuser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('user recently changed password please login again', 401)
    );
  }
  res.locals.user = freshuser;
  // GRANT ACCEsS TO PROTECTED ROUTE
  req.user = freshuser;
  next();
});
// only for rendering pages no errors
exports.isLoggedIn = async (req, res, next) => {
  // 1) getting the token and check it exists
  if (req.cookies.token) {
    try {
      // 2) token verification
      const decoded = await promisify(jwt.verify)(
        req.cookies.token,
        process.env.JWT_SECRET
      );
      // console.log(decoded);
      // 3) if the user still exists?
      const freshuser = await User.findById(decoded.id);

      // 4) check if user changed password after the token was issued
      if (freshuser.changePasswordAfter(decoded.iat)) {
        return next();
      }
      // GRANT ACCEsS TO PROTECTED ROUTE
      res.locals.user = freshuser;

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('there is no user with this email', 404));
  // 2  generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3 sent it to users email

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('there was an error sending the email.try again later!', 500)
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2)if token has not expired and there is user set the new password
  if (!user) {
    console.log(hashedToken);
    console.log(User);

    return next(new AppError('token is invalid or has expired', 400));
  }
  // 3) update changedPasswordAt property for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.PasswordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 4) log the user in send Jwt
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get user from collection
  const user = await User.findById(req.user.id).select('+password');

  //  2)check if POSTed  current password is correct
  if (!user.correctPassword(req.body.passwordCurrent, user.password)) {
    return next(new AppError('incorrect password', 401));
  }
  //  3)if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findById and Update will not work as intended:

  //  4)Log user in send,JWT
  createSendToken(user, 200, res);
});

// exports.forgotPassword = catchAsync(async (req, res, next) => {
//   // 1) get registered email
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     return next(
//       new AppError('there is no user with email' + req.body.email, 404)
//     );
//   }
//   // 2)generate a random token
//   const resetToken = user.createPasswordResetToken();
//   await user.save({ validateBeforeSave: false });
//   // 3)send it as email
//   const resetURL = `${req.protocol}://${req.get(
//     'host'
//   )}/api/v1/users/resetPassword/${resetToken}`;
//   const message = `forgot your password? submit your pswrd and pswrdConfirm to ${resetURL}.\nIf you didnt forget please ignore this mail`;
//   try {
//     await sendEmail({
//       email: user.email,
//       subject: 'yur pswrd reset token( valid for 10 min)',
//       message,
//     });
//     res.status(200).json({ status: 'success', message: 'Token sent to email' });
//   } catch (err) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });
//     return next(
//       new AppError(
//         'there is something wrong with sending email try again later',
//         500
//       )
//    v  );
//   }
// });
// exports.resetPassword = catchAsync(async (req, res, next) => {
//   //1) get user based on the tokn
//   const hashedToken = crypto
//     .createHash('sha256')
//     .update(req.params.token)
//     .digest('hex');

//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   });
//   // 2) if token has not expired and there is user set new password
//   if (!user) {
//     next(new AppError('bad request', 400));
//   }
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   await user.save();
//   // 3)pdate changed password at property for the user
//   // 4)log the user in, send jwt
//   const token = signToken(user._id);
//   res.status(200).json({
//     status: 'success',
//     token,
//   lk
