class ApiResponse {
  static success(data = null, message = "Success") {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message = "Error", statusCode = 500, error = null) {
    return {
      success: false,
      message,
      statusCode,
      error,
    };
  }
}

module.exports = ApiResponse;
