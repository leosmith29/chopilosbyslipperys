const { body, validationResult } = require('express-validator');

// Validate Register Input
exports.validateRegisterInput = [
  body('name', 'Name is required').notEmpty(),
  body('email', 'Invalid email address').isEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    next();
  },
];

// Validate Login Input
exports.validateLoginInput = [
  body('email', 'Invalid email address').isEmail(),
  body('password', 'Password is required').notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    next();
  },
];


const validateOrderInput = (req, res, next) => {
  const { items, pickupType, pickupTime } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Order must include at least one item' });
  }

  if (!pickupType || (pickupType !== 'pickup' && pickupType !== 'delivery')) {
    return res.status(400).json({ error: 'Invalid pickup type' });
  }

  if (pickupType === 'delivery' && (!req.body.deliveryAddress || !req.body.deliveryCity || !req.body.deliveryState || !req.body.deliveryZip)) {
    return res.status(400).json({ error: 'Delivery address is required for delivery orders' });
  }

  if (pickupType === 'pickup' && (!pickupTime || new Date(pickupTime) <= new Date())) {
    return res.status(400).json({ error: 'Invalid pickup time' });
  }

  next();
};

exports.validateResetPasswordInput = (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords must match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  next();
};

