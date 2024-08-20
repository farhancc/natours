const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const app = express();
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const AppError = require('./utils/appError.js');
const globalErrorHandling = require('./controllers/errorController.js');

const tourRouter = require('./routes/tourRoutes.js');
const userRouter = require('./routes/userRoutes.js');
const reviewRouter = require('./routes/reviewRouts.js');
const viewRouter = require('./routes/viewRouts.js');
const bookingRouter = require('./routes/bookingRouts.js');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// Global midddlewares
// serve static files
app.use(express.static(path.join(__dirname, 'public')));
// security http headers

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://api.mapbox.com',
          'https://cdn.jsdelivr.net',
          'https://*.jsdelivr.net',
          'https://unpkg.com',
          'blob:', // Add this for Web Workers
          'https://js.stripe.com',
        ],
        frameSrc: ["'self'", 'https://*.stripe.com'],
        // imgSrc: ["'self'", 'https://*.stripe.com'],
        connectSrc: ["'self'", 'https://*.stripe.com'],
        formAction: ["'self'", 'https://*.stripe.com'],
        workerSrc: ["'self'", 'blob:'], // Add this for Web Workers
        childSrc: ["'self'", 'blob:'], // Add this for Web Workers
        connectSrc: [
          "'self'",
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com',
          '*',
        ],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.mapbox.com',
          'https://*.stripe.com',
        ], // Add 'blob:' here
        styleSrc: ["'self'", "'unsafe-inline'", 'https://api.mapbox.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'], // Add this for Google Fonts
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Add this if you're having issues with COEP
  })
);
// development logging
app.use(morgan('dev'));
// limit rating
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests try again after an hour',
});
app.use('/api', limiter);

// data parser reading data from body into req.body
app.use(
  express.json({
    limit: '10kb',
  })
);
app.use(express.urlencoded({ limit: '10kb', extended: true }));
app.use(cookieParser());
// after getting body we have to clean that(data sanitization) this is the perfect place
// against noSQL query injection
app.use(mongoSanitize());
// against  xss (cross site scripting)
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
// serving static file
// app.use(express.static(`${__dirname}/public`));

// -----------end of middleware stack-------------------
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // BASIC----------------1
  // res.status(404).json({
  //   status: 'fail',
  //   message: `cant find ${req.originalUrl} on this server`,
  // });

  //GOOD-------------------------2
  // const err = new Error(`Cant find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // // console.log(err);
  // next(err);
  // TOP-------------------------3
  next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandling);
module.exports = app;
