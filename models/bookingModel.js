const mongoose = require('mongoose');
const { bool } = require('sharp');
const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'boooking must be a tour'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'boooking must be belongs to a user'],
  },
  price: {
    type: Number,
    required: [true, 'booking must have a price'],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});
bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
  next();
});
const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
