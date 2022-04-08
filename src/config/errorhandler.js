const ApiError = require('./apierror');
exports.errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    res.status(err.code).json({
      status: err.code,
      message: err.msg,
      success: false,
    });
  }
  res.status(500).json({
    status: 500,
    message: 'oops! something went wrong',
    success: false,
  });
};

exports.checkvar = (key) => {
  if (process.env[key] === undefined) {
    return process.env[key];
  }
  return process.env[key];
};

// app.use((req,res,next)=>{
//     const error = new Error('not found')
//     error.status(404)
//     next(error)
//   })

//   app.use((error,req,res,next)=>{
//     res.status(error.status || 500).json({
//       error:{
//         message: error.message
//       }
//     })
//   })
