
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/db.js');
const { validateRegisterInput, validateLoginInput } = require('../middleware/users.js');


exports.AuthRoute = ({app})=>{
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
  
  
  // Forgot Password route
  app.post('/api/v1/users/forgot-password', async (req, res) => {
    //   const { errors, isValid } = validateForgotPasswordInput(req.body);
    
    //   if (!isValid) {
    //     return res.status(400).json(errors);
    //   }
    
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
    
  
}