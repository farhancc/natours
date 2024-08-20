// review/rating createdAt/ ref to tour/ ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review cant be empty'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 1,
      max: 5,
      // enum: [0, 1, 2, 3, 4, 5],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'review must be belongs to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must be belongs to a User'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.pre(/^find/, function (next) {
  this
    // .populate({ path: 'tour', select: 'name' })
    // removed becouse it populate when we virually populating reviews in get a tour rout
    .populate({
      path: 'user',
      select: 'name photo',
    });
  next();
});

reviewSchema.statics.calcAverageRating = async function (tourId) {
  const stat = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stat);
  if (stat.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stat[0].nRating,
      ratingsAverage: stat[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage,
      ratingsQuantity,
    });
  }
};
//use post not pre because we want result after saving the document
reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRating(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  const r = await this.findOne();
  console.log(r);
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  // const r = await this.findOne();  does Not work here, query has already executed
  await this.r.constructor.calcAverageRating(this.r.tour);
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
