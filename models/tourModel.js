const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');
const validator = require('validator');
const Review = require('./reviewModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'a tour must have a name'],
      unique: true,
      maxlength: [40, 'maximum 40 characters are allowed'],
      // commented becouse it dont support spaces👇🏻👇🏻
      // validate: [validator.isAlpha, 'only alphabet allowed in name'],
      trim: true,
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'a tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'a tour must have a max group size'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'difficult'],
      required: [true, 'a tour must have a difficulty level'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be above 1.0'],
      max: [5, 'rating must be below 5'],
      set: (value) => Math.round(value * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: [true, 'a tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // This fun is not going to work on update (this point to current document)
        validator: function (val) {
          return val < this.price;
        },
        message: 'discount {VALUE} must be less than price{this.price}',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'a tour must have a summery'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'a tour must have a image cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guids: Array,
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  // Review is what we export from review model
  foreignField: 'tour',
  // tour is what we use as field in review model
  localField: '_id',
  // lusing id
});

// Document middle ware run before .save() and .create() command
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// Query MIddle ware
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });
// ---------embedding user id-------------------
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guids.map(async (id) => await User.findById(id));
//   this.guids = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  // for every query start with find
  this.find({ secretTour: { $ne: true } });
  next();
  this.start = Date.now();
});

// aggrigation middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // console.log(docs);
  console.log(`Query took ${Date.now() - this.start} milli sec`);
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
