const express = require('express');
const userRouter = express.Router();

const {
  signUp,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} = require('../controllers/authController.js');

const {
  getAllUsers,
  createUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  imageUpload,
  resizeUserPhoto,
} = require('../controllers/usersController.js');
const multer = require('multer');

userRouter.route('/signup').post(signUp);
userRouter.route('/login').post(login);
userRouter.route('/logout').get(logout);
userRouter.route('/forgotpassword').post(forgotPassword);

// protect all router after this
userRouter.use(protect);

userRouter.route('/updateme').patch(imageUpload, resizeUserPhoto, updateMe);
userRouter.route('/deleteme').patch(deleteMe);
userRouter.route('/resetPassword/:token').patch(resetPassword);
userRouter.route('/updatepassword').patch(updatePassword);
userRouter.route('/me').get(getMe, getUser);

userRouter.use(restrictTo('admin'));

userRouter.route('/').get(getAllUsers).post(createUsers);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;
