export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(422).json({
        error: "VALIDATION_ERROR",
        details: error.details.map((item) => item.message),
      });
    }
    req.body = value;
    return next();
  };
}
