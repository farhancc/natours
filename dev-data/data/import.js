const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
dotenv.config({ path: './../../config.env' });
// const db=process.env.DB
const db =
  'mongodb+srv://farhancc123:4dhDRrvm26bSMYWr@cluster0.fduiv9l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const mongoose = require('mongoose');
const fs = require('fs');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');
// const Tour=require('./models/tourModel');
// just text like this
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('db connection successful'));

// read data from json file and save it to the database
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
// console.log(__dirname);
// console.log(tours);gg
const importData = async () => {
  try {
    await Tour.create(tours, { validateBeforeSave: false });
    console.log('data imported');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
//  delete all data in collection before importing new one
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data deleted');
    process.exit();
  } catch (e) {
    console.log(e);
  }
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
