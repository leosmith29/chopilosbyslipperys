const {User,Order,MenuItem,Review} = require('../models/db.js')
const Sequelize = require('sequelize');
exports.InstallRoute = ({app}) =>{

    app.post('/api/v1/initialize', async (req, res) => {
        const { database } = req.body;
      
        if (database !== 'mysql' && database !== 'postgres') {
          return res.status(400).json({ error: 'Invalid database selection' });
        }

        try {
          // Initialize Sequelize with selected database
          console.log({
            dialect: database,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
          })
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
}