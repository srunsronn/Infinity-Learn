import ErrorHandler from "../utils/errorHandler.js";

const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    //wrong mongDb id error
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(400, message);
    }

    // Duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(400, message);
    }

    // wrong jwt error
    if (err.name === "JsonWebTokenError") {
        const message = "JSON Web Token is invalid. Try again!!!";
        err = new ErrorHandler(400, message);
    }

    // wrong jwt expired error
    if (err.name === "TokenExpiredError") {
        const message = "JSON Web Token is expired. Try again!!!";
        err = new ErrorHandler(400, message);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errors: err.errors,
    });

}

export default errorMiddleware;
