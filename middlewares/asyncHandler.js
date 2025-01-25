const asyncHandler = (fn) => (rep, res, next) => {
    Promise.resolve(fn(rep, res, next)).catch(error => {
        res.status(500).json({message: error.message});
    });

};

export default asyncHandler;