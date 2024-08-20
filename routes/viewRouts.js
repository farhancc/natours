const express = require('express');
const viewsController = require('./../controllers/viewsControllers');
const router = express.Router();

const bookingController = require('../controllers/bookingController');
const authantication = require('../controllers/authController');
router.get('/me', authantication.protect, viewsController.getAccount);
router.get('/my-tours', authantication.protect, viewsController.getMyTours);
router.post(
  '/submit-user-data',
  authantication.protect,
  viewsController.updateUserData
);

router.use(authantication.isLoggedIn);
router.get(
  '/',
  bookingController.createBookingCheckout,
  viewsController.getOverview
);
// router.get('/tour', viewsController.tours);
router.get('/tours/:slug', viewsController.getTour);
// login
router.get('/login', viewsController.login);

module.exports = router;
