const errorHandler = (err, req, res, next) => {
  console.error(err); // terminal me error show

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message || "Server Error",
  });
};

module.exports = errorHandler;