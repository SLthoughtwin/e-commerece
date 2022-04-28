const ApiError = require('./apierror');

exports.errorHandler = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.code).json({
      error: { statusCode: error.code, message: error.msg },
    });
  } else {
    return res.status(500).json({
      error: { statusCode: 500, message: 'oops! something went wrong' },
    });
  }
};

exports.responseHandler = (status,msg, res,data) => {
 if(data){
    return res.status(status).json({
      data: { statusCode:status, message: msg,data},
    });
   }
    return res.status(status).json({
      data: { statusCode:status, message: msg},
    });
};

exports.checkvar = (key) => {
  if (process.env[key] === undefined) {
    return process.env[key];
  }
  return process.env[key];
};



// app.use((req, res, next) => {
//   const error = new Error('something went wrong!!');
//   error.status  = 404;
//   next(error);
// });

// app.use((error, req, res, next) => {
//   console.log("==========>",error)
//   res.status(error.status || 500).json({
//     error: {
//       statusCode: error.status || 500 ,
//       message: error.message,
//     },
//   });
// });
