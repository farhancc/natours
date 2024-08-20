const express = require('express');
const authController = require('../controllers/authController.js');
// const fs=require('fs');
const tourRouter = express.Router();
const reviewRouter = require('./../routes/reviewRouts.js');
// const reviewController = require('./../controllers/reviewController.js');
const {
  getAllTours,
  addTour,
  getAtour,
  editTour,
  deleteTour,
  checkID,
  checkBody,
  aliasTopTours,
  getTourAggregate,
  getDistances,
  resizeTourImages,
  uploadTourImage,
  getTousWithin,
  monthlyPlan,
} = require('../controllers/toursController.js');

// ----------------------------------------------------------------------------
// const reviewController = require('../controllers/reviewController.js');

// tourRouter
//   .route(`/:tourId/reviews`)
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );
// ----------------------------------------------------------------------------
tourRouter.use('/:tourId/reviews', reviewRouter);

// tourRouter.param('id',checkID)
tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours);
tourRouter
  .route(`/monthly-plan/:year`)
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    monthlyPlan
  );
tourRouter
  .route('/tour-stats')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    getTourAggregate
  );

tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getTousWithin);
tourRouter.route('/distances/:latlng/unit/:unit').get(getDistances);
// protect middleware were run first and if not authenticated there will be an error
tourRouter.route('/').get(authController.protect, getAllTours).post(addTour);
tourRouter
  .route(`/:id`)
  .get(getAtour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    uploadTourImage,
    resizeTourImages,
    editTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    deleteTour
  );

module.exports = tourRouter;
