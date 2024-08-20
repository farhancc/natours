const {
  createReview,
  getAllReview,
  getaReview,
  deleteReview,
  UpdateReview,
  setTourUserIds,
} = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const express = require('express');
const reviewRoute = express.Router({ mergeParams: true });

reviewRoute.use(authController.protect);

reviewRoute
  .route('/')
  .get(getAllReview)
  .post(authController.restrictTo('user'), setTourUserIds, createReview);
reviewRoute
  .route('/:id')
  .delete(deleteReview)
  .patch(authController.restrictTo('admin', 'user'), UpdateReview)
  .get(authController.restrictTo('admin', 'user'), getaReview);

module.exports = reviewRoute;
