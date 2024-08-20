// const fs=require('fs');
const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apifeaturs');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handleFactory');
const multer = require('multer');
const sharp = require('sharp');
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('uploaded file is not a image ,please upload a image ', 400),
      false
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImage = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
exports.resizeTourImages = async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  // 1 Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  console.log(req.files);
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2 images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );
  console.log(req.files, 'images');

  next();
};
// const tours=JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf8'))

// exports.checkID=(req,res,next,val)=>{
//   console.log(val);
//   const id=req.params.id*1;
//   if(id>tours.length)
//   return res.status(404).json({status: '404 Not Found'})
// next();
// }

// exports.checkBody=(req,res,next)=>{
//   if (!req.body.name||!req.body.price)
//   return res.status(400).json({status: '400 Bad Request',messag:'body or price is missing'})
//    next()
// }

// aliasing common router
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price';
  req.query.fields = 'name,price,summary';
  next();
};

exports.getAllTours = factory.getAll(Tour);

// exports.getAllTours = catchAsync(async (req, res) => {
//   // try {
//   //     // WE BUILD QUERY

//   //     // filtering
//   //     const queryObj={...req.query}
//   //     const excludedFields=['page','sort','limit','fields'];
//   //     excludedFields.forEach(el=>delete queryObj[el])
//   //     // console.log(req.query,queryObj);
//   //     // advance filtering
//   //     let querystr=JSON.stringify(queryObj);

//   //     querystr=querystr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`)

//   //     console.log(JSON.parse(querystr));

//   //     let query=  Tour.find(JSON.parse(querystr))
//   // // sorting
//   // if(req.query.sort)
//   // {
//   //   const sortBy=req.query.sort.split(',').join(' ')
//   //   console.log(sortBy);
//   //   query=query.sort(sortBy)

//   // }
//   // else{
//   //   query=query.sort('-createdAt')
//   // }
//   // // field limiting
//   // if(req.query.fields){
//   //   const fields=req.query.fields.split(',').join(' ');
//   //   query=query.select(fields)
//   // }
//   // else{
//   //   query=query.select('-__v')
//   // }
//   // // pagination
//   // const page=req.query.page*1||1
//   // const limit =req.query.limit*1||3
//   // const skip =(page-1)*limit

//   // query=query.skip(skip).limit(limit)
//   // if(req.query.page){
//   //   const numTours=await Tour.countDocuments();
//   //   if(skip>=numTours)
//   //   {
//   //     throw new Error('no page found')
//   //   }
//   // }

//   // EXECUTE QUERY
//   const featurs = new APIFeatures(Tour.find(), req.query)
//     .sort()
//     .limitFields()
//     .paginate()
//     .filter();
//   const tours = await featurs.query;

//   // RESPONSES
//   res.status(200).json({
//     status: 'success',
//     data: {
//       data: {
//         tours,
//       },
//     },
//   });
//   // } catch (err) {
//   //   res.status(400).json({ status: 'bad request' });
//   // }
// });

exports.addTour = catchAsync(async (req, res) => {
  // const newId=tours[tours.length-1].id+1
  // const newTour=Object.assign({id:newId},req.body)
  // tours.push(newTour)
  // fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`,JSON.stringify(tours),err=>{res.status(201).json({status:"success",data:{tours:newTour}})})
  // try {
  const newTour = await Tour.create(req.body);
  res.status(201).json({ status: 'success', data: { tour: newTour } });
  // }
  //  catch (err) {
  //   res.status(400).json({ status: 'error', message: err.message });
  // }
});

// exports.getAtour = catchAsync(async (req, res, next) => {
//   // try {
//   // const id=req.params.id*1;
//   // const tour = tours.find(el=>{return el.id ===id})
//   //.populate('guids') is used to get data from objId  stored as guids in model(replace id with actual data)
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   // .populate({
//   //   path: 'guids',
//   //   select: '-__V -passwordChangedAt',
//   // });
//   // made a middle ware becouse we want to use every find query
//   // console.log('hi');
//   if (!tour) {
//     return next(new AppError('page not found', 404));
//   }
//   // } catch (err) {
//   //   res.status(400).json({ status: 'error' });
//   // }
//   res.status(200).json({ status: 'success', data: tour });
// });
exports.getAtour = factory.getOne(Tour, { path: 'reviews' });
exports.editTour = factory.updateOne(Tour);
// exports.editTour = catchAsync(async (req, res) => {
//   // try {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//   });
//   if (!tour) {
//     return next(new AppError('page not found', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// } catch (err) {
//   res.status(400).json({ status: 'error', message: err.message });
// }
// });

exports.deleteTour = factory.deleteOne(Tour);
// -------------------------------------------------------------
// exports.deleteTour = catchAsync(async (req, res) => {
//   // try {
//   await Tour.findByIdAndDelete(req.params.id);
//   res.status(204).json({ status: 'success', data: null });
//   // } catch (err) {
//   //   res.status(400).json({ status: 'error', message: err.message });
//   // }
// });

exports.getTourAggregate = catchAsync(async (req, res) => {
  // try {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
      },
    },
    { $sort: { avgPrice: -1 } },
  ]);
  res.status(200).json({ status: 'success', data: stats });
  // } catch (err) {
  //   res.status(400).json({ status: 'error', message: err.message });
  // }
});

exports.monthlyPlan = catchAsync(async (req, res) => {
  // try {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-06-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numOfTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    // {
    //   $project: {
    //     _id: 0,
    //   },
    // },
    {
      $sort: { numOfTours: -1 },
    },
    {
      $limit: 6,
    },
  ]);
  res.status(200).json({ status: 'success', data: plan });
  // } catch (err) {
  //   res.status(400).json({ status: 'error', message: err.message });
  // }
});

exports.getTousWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  // to get radians of map you should divide distance by earths radius
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        'please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lat, lng], radius] } },
  });
  // console.log(distance, lat, lng, unit);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { data: tours },
  });
});
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        'please provide latitude and longitude in format of lat,lng',
        400
      )
    );
  }
  //for geospatial aggregation there is only one single stage that is Geonear
  //this should be always the first one in pipeline
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: { data: distances },
  });
});
