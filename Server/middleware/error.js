export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
    return res.status(503).json({
      message: 'Database operation timed out. Please try again.'
    });
  }

  res.status(500).json({
    message: err.message || 'Internal server error'
  });
}; 