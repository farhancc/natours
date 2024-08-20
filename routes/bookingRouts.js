const express = require('express');
const router = express.Router();
const bookingControllers = require('../controllers/bookingController');
const authControllers = require('../controllers/authController');
router
  .route('/checkout-session/:tourID')
  .get(authControllers.protect, bookingControllers.getCheckoutSession);
module.exports = router;
