const errorHandlerMiddleware = async (err, req, res, next) => {
    if (res.headerSend) {
        return next(err);
    }

    if(err.status === 404) {
        return res.status(404).json({ msg: "Not Found"});
    }

    return res.status(500).json({ msg: "Something went Wrong"});
};

module.exports = errorHandlerMiddleware