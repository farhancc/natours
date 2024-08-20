const Review = require('../models/reviewModel');
// const User = require('../models/userModel');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory');
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.createReview = factory.createOne(Review);
// exports.createReview = catchAsync(async (req, res, next) => {
//   if (!req.body.tour) {
//     req.body.tour = req.params.tourId;
//   }
//   if (!req.body.user) req.body.user = req.user.id;

//   const newReview = await Review.create(req.body);

//   res.status(201).json({ status: 'success', data: { review: newReview } });
// });
// exports.getReview = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) {
//     filter = {
//       tour: req.params.tourId,
//     };
//   }
//   const reviews = await Review.find(filter).populate('user');
//   res.status(200).json({
//     status: 'success',
//     result: reviews.length,
//     Data: {
//       reviews,
//     },
//   });
// });
// exports.filterId = (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) {
//     filter = {
//       tour: req.params.tourId,
//     };
//   }
// };

exports.getAllReview = factory.getAll(Review);
exports.getaReview = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.UpdateReview = factory.updateOne(Review);
