
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, } = require('../models');
const { validateRegisterInput, validateLoginInput } = require('../middlewares/validation');


// User Registration Endpoint
app.post('/register', validateRegisterInput, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ success: false, message: 'User with email already exists', data: null });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({ success: true, message: 'User registered successfully', data: { id: user.id, name, email } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong', data: null });
  }
});

// User Login Endpoint
app.post('/login', validateLoginInput, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found', data: null });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password', data: null });
    }

    // Sign JWT token
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.json({ success: true, message: 'User authenticated successfully', data: { token } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong', data: null });
  }
});

module.exports = router;

// Forgot Password route
app.post('/api/v1/users/forgot-password', async (req, res) => {
    const { errors, isValid } = validateForgotPasswordInput(req.body);
  
    if (!isValid) {
      return res.status(400).json(errors);
    }
  
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ where: { email } });
  
      if (!user) {
        return res.status(404).json({ email: 'User not found' });
      }
  
      const token = crypto.randomBytes(20).toString('hex');
      user.reset_password_token = token;
      user.reset_password_expires = Date.now() + 3600000; // 1 hour
  
      await user.save();
  
      const msg = {
        to: email,
        from: 'noreply@example.com',
        subject: 'Password Reset',
        text: `You are receiving this email because you (or someone else) has requested the reset of the password for your account. Please click on the following link, or paste this into your browser to complete the process: http://${req.headers.host}/reset/${token} If you did not request this, please ignore this email and your password will remain unchanged.`
      };
      await sgMail.send(msg);
  
      res.json({ message: 'Email sent' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Profile route
  app.get('/api/v1/users/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      is_admin: req.user.is_admin
    });
  });

  
  // Create Order route
app.post('/api/v1/orders', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { errors, isValid } = validateOrderInput(req.body);
  
    if (!isValid) {
      return res.status(400).json(errors);
    }
  
    try {
      const { user_id, pickup_time, delivery_address, items } = req.body;
  
      const user = await User.findOne({ where: { id: user_id } });
  
      if (!user) {
        return res.status(404).json({ user_id: 'User not found' });
      }
  
      const order = await Order.create({
        user_id,
        pickup_time,
        delivery_address
      });
  
      const order_items = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity
      }));
  
      await OrderItem.bulkCreate(order_items);
  
      res.json({ message: 'Order created successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get All Orders route
  app.get('/api/v1/orders', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      const orders = await Order.findAll({ where: { user_id: req.user.id } });
  
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create Menu Item route
app.post('/api/v1/menu', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { errors, isValid } = validateMenuItemInput(req.body);
  
    if (!isValid) {
      return res.status(400).json(errors);
    }
  
    try {
      const { name, description, price, category } = req.body;
  
      const menuItem = await MenuItem.create({
        name,
        description,
        price,
        category
      });
  
      res.json({ message: 'Menu item created successfully', menuItem });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get All Menu Items route
  app.get('/api/v1/menu', async (req, res) => {
    try {
      const menuItems = await MenuItem.findAll();
  
      res.json(menuItems);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  
  // Create Review route
app.post('/api/v1/reviews', async (req, res) => {
    const { errors, isValid } = validateReviewInput(req.body);
  
    if (!isValid) {
      return res.status(400).json(errors);
    }
  
    try {
      const { name, email, message } = req.body;
  
      const review = await Review.create({
        name,
        email,
        message
      });
  
      res.json({ message: 'Review created successfully', review });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get All Reviews route
  app.get('/api/v1/reviews', async (req, res) => {
    try {
      const reviews = await Review.findAll();
  
      res.json(reviews);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create Reservation route
app.post('/api/v1/reservations', async (req, res) => {
    const { errors, isValid } = validateReservationInput(req.body);
  
    if (!isValid) {
      return res.status(400).json(errors);
    }
  
    try {
      const { name, email, phone, date, time, partySize } = req.body;
  
      const reservation = await Reservation.create({
        name,
        email,
        phone,
        date,
        time,
        partySize
      });
  
      res.json({ message: 'Reservation created successfully', reservation });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Create Reward route
  app.post('/api/v1/rewards', async (req, res) => {
    const { errors, isValid } = validateRewardInput(req.body);
  
    if (!isValid) {
      return res.status(400).json(errors);
    }
  
    try {
      const { customerId, rewardName, rewardDescription, rewardValue } = req.body;
  
      const reward = await Reward.create({
        customerId,
        rewardName,
        rewardDescription,
        rewardValue
      });
  
      res.json({ message: 'Reward created successfully', reward });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get Rewards by Customer route
  app.get('/api/v1/rewards/:customerId', async (req, res) => {
    const customerId = req.params.customerId;
  
    try {
      const rewards = await Reward.findAll({
        where: { customerId }
      });
  
      res.json(rewards);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create Event route
app.post('/api/v1/events', async (req, res) => {
    const { errors, isValid } = validateEventInput(req.body);
  
    if (!isValid) {
      return res.status(400).json(errors);
    }
  
    try {
      const { name, description, date, startTime, endTime } = req.body;
  
      const event = await Event.create({
        name,
        description,
        date,
        startTime,
        endTime
      });
  
      res.json({ message: 'Event created successfully', event });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get Events route
  app.get('/api/v1/events', async (req, res) => {
    try {
      const events = await Event.findAll();
  
      res.json(events);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Create Gift Card route
  app.post('/api/v1/gift-cards', async (req, res) => {
    const { errors, isValid } = validateGiftCardInput(req.body);
  
    if (!isValid) {
      return res.status(400).json(errors);
    }
  
    try {
      const { name, email, amount } = req.body;
  
      const giftCard = await GiftCard.create({
        name,
        email,
        amount
      });
  
      res.json({ message: 'Gift card created successfully', giftCard });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get Gift Cards route
  app.get('/api/v1/gift-cards', async (req, res) => {
    try {
      const giftCards = await GiftCard.findAll();
  
      res.json(giftCards);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  
  app.post('/api/v1/initialize', async (req, res) => {
    const { database } = req.body;
  
    if (database !== 'mysql' && database !== 'postgres') {
      return res.status(400).json({ error: 'Invalid database selection' });
    }
  
    try {
      // Initialize Sequelize with selected database
      const sequelize = new Sequelize({
        dialect: database,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
  
      // Define and sync models to database
      await User.sync({ force: true });
      await Order.sync({ force: true });
      await MenuItem.sync({ force: true });
      await Review.sync({ force: true });
      await Reservation.sync({ force: true });
      await Reward.sync({ force: true });
      await Event.sync({ force: true });
      await GiftCard.sync({ force: true });
  
      res.json({ message: 'Database initialized successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
