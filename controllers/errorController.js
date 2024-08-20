const AppError = require('../utils/appError');
const handleJWTerror = (err) =>
  new AppError('invalid token. please log in again', 401);

const senderrProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
      });
    }
    console.log('ERROR💥💥', err);
    return res
      .status(500)
      .json({ status: 'error', message: 'internal server error' });
  } else {
    // for rendered website
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        status: err.status,
        error: err,
        msg: err.message,
      });
    }
    console.log('ERROR💥💥', err);
    return res
      .status(500)
      .render('error', { status: 'error', msg: 'please try again later' });
  }
};

function handleDuplicateDB(err) {
  console.log(err);
  // const val = err.errmsg.match(/"(.*?)"/)[0];
  const message = `Duplicate file  ${err} `;
  return new AppError(message, 400);
}
function handleCastErrorDB(err) {
  const message = `invalid ${err.path} ${err.value}`;
  return new AppError(message, 400);
}
function handleJWTexpired(er) {
  return new AppError('Jwt token expired', 401);
}

const senderrDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res
      .status(err.statusCode)
      .render('error', { title: 'something went wrong', msg: err.message });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    senderrDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.name == 'JsonWebTokenError') error = handleJWTerror(error);
    if ((error.name = 'TokenExpiredError')) error = handleJWTexpired(error);
    if (error.code === 11000) error = handleDuplicateDB(error);

    senderrProd(error, req, res);
  }
};
