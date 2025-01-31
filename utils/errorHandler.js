class ErrorHandler extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; 
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
export default ErrorHandler;
