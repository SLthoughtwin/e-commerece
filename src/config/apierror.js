class ApiError {
  constructor(code, msg) {
    this.code = code;
    this.msg = msg;
  }
  static BadRequest(msg) {
    return new ApiError(400, msg);
  }
  static Unauthorized(msg) {
    return new ApiError(401, msg);
  }
  static Forbidden(msg) {
    return new ApiError(403, msg);
  }
  static Unprocessable(msg) {
    return new ApiError(422, msg);
  }
}


module.exports = ApiError;
