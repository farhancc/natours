const mongoose = require('mongoose');
const dotenv = require('dotenv');

// this error handler should be in top
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandle Exception Shutting down....');
  // server.close(() => {
  //   process.exit(1);
  // });
});

dotenv.config({ path: './config.env' });
const db = process.env.DB;
const app = require('./app');
// const Tour=require('./models/tourModel');
// just text like this
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('db connection successful');
  });
// console.log(process.env);
const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log('app running on port ' + PORT);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandle rejection Shutting down....');
  server.close(() => {
    process.exit(1);
  });
});
