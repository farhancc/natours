const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('./../utils/apifeaturs');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res) => {
    // try {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({ status: 'success', data: null });
    // } catch (err) {
    //   res.status(400).json({ status: 'error', message: err.message });
    // }
  });

// exports.deleteTour = catchAsync(async (req, res) => {
//   // try {
//   await Tour.findByIdAndDelete(req.params.id);
//   res.status(204).json({ status: 'success', data: null });
//   // } catch (err) {
//   //   res.status(400).json({ status: 'error', message: err.message });
//   // }
// });

exports.updateOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No tour found with that ID'));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    if (!doc) {
      return next(new AppError('something went wrong'));
    }
    res.status(201).json({
      status: 'success',
      data: { doc },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError('No document found with that Id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: { doc },
      },
    });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    let filter = {};
    if (req.params.tourId) {
      filter = {
        tour: req.params.tourId,
      };
    }
    const featurs = new APIFeatures(Model.find(filter), req.query)
      .sort()
      .limitFields()
      .paginate()
      .filter();
    const doc = await featurs.query;
    // .explain();

    // RESPONSES
    res.status(200).json({
      status: 'success',
      data: {
        data: {
          doc,
        },
      },
    });
  });
