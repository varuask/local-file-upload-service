module.exports = (err, req, res, next) => {
  const code = err.code === 'LIMIT_FILE_SIZE' ? 413 : err.code;
  const message = err.message;
  return res.status(code).json({
    error: {
      message,
    },
  });
};
