class APIFeatures {
  constructor(query, querystr) {
    this.query = query;
    this.querystr = querystr;
  }
  filter() {
    const queryObj = { ...this.querystr };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    // console.log(req.query,queryObj);
    // advance filtering
    let queryString = JSON.stringify(queryObj);

    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    // console.log(JSON.parse(queryString));
    this.query.find(JSON.parse(queryString));
    // let query=  Tour.find(JSON.parse(querystr))
    return this;
  }
  sort() {
    if (this.querystr.sort) {
      const sortBy = this.querystr.sort.split(',').join(' ');
      console.log(sortBy);
      this.query = this.query.sort(sortBy);
    }
    // else{
    //   this.query=this.query.sort('-createdAt')
    // }
    return this;
  }
  limitFields() {
    if (this.querystr.fields) {
      const fields = this.querystr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    const page = this.querystr.page * 1 || 1;
    const limit = this.querystr.limit * 1 || 3;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
