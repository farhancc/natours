const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const Booking = require('../models/bookingModel');
exports.getOverview = catchAsync(async (req, res) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // 2) build Template
  // 3) render That template with data from step 1
  res.status(200).render('overview', { title: 'All tours', tours });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('tour not found', 404));
  }
  console.log(tour);
  res.status(200).render('tour', { title: 'The Forest hiker Tour', tour });
});
exports.login = (req, res) => {
  res.status(200).render('loginTemplate', { title: 'Log into your account' });
};
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'your account',
  });
};
exports.updateUserData = catchAsync(async (req, res) => {
  console.log(req.body);
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'your account',
    user: updatedUser,
  });
});
exports.getMyTours = catchAsync(async (req, res, next) => {
  // find all boookings
  const bookings = await Booking.find({ user: req.user.id });
  //find tours with returned ids
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });
  res.status(200).render('overview', { title: 'myTours', tours });
});
