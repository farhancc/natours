const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const APIFeatures = require('./../utils/apifeaturs');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handleFactory');
const Booking = require('./../models/bookingModel');
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1 get currently booked tour
  const tour = await Tour.findById(req.params.tourID);
  // 2 create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourID
    }&user=${req.user.id}&price=${tour.price}`,
    mode: 'payment',
    cancel_url: `${req.protocol}://${req.get('host')}/tour=${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`], // If you want to include images
          },
          unit_amount: tour.price * 100, // Stripe expects the amount in cents
        },
        quantity: 1,
      },
    ],
  });
  // 3 create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // temper
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
  // res.redirect(`${req.protocol}://${req.get('host')}/`);
});
