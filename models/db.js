const Sequelize = require('sequelize');

// Define the sequelize instance
// const sequelize = new Sequelize(process.env.DATABASE_URL);
console.log({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})
const sequelize = new Sequelize('postgres://postgres:secret@74.208.145.153:5432/postgres');
// Define User model
const User = sequelize.define('user', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  is_admin: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});

// Define Order model
const Order = sequelize.define('order', {
  customer_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  customer_email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  pickup_time: {
    type: Sequelize.DATE,
    allowNull: false
  },
  delivery_address: {
    type: Sequelize.STRING,
    allowNull: false
  },
  total_amount: {
    type: Sequelize.FLOAT,
    allowNull: false
  }
});

// Define OrderItem model
const OrderItem = sequelize.define('order_item', {
  item_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  price: {
    type: Sequelize.FLOAT,
    allowNull: false
  }
});

// Define Review model
const Review = sequelize.define('review', {
  customer_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  review_text: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  rating: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

// Define Event model
const Event = sequelize.define('event', {
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  start_time: {
    type: Sequelize.DATE,
    allowNull: false
  },
  end_time: {
    type: Sequelize.DATE,
    allowNull: false
  }
});

// Define Reservation model
const Reservation = sequelize.define('reservation', {
  customer_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  customer_email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  reservation_time: {
    type: Sequelize.DATE,
    allowNull: false
  },
  party_size: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

// Define GiftCard model
const GiftCard = sequelize.define('gift_card', {
  recipient_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  recipient_email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  amount: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  message: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  sender_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  sender_email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  is_redeemed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});

const MenuItem = sequelize.define('menu_item', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  price: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  category: {
    type: Sequelize.ENUM('food', 'soup', 'drinks', 'beverages'),
    allowNull: false
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    field: 'created_at'
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    field: 'updated_at'
  }
});

// Define model associations
User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Review);
Review.belongsTo(User);

User.hasMany(Reservation);
Reservation.belongsTo(User);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

module.exports = { User, Order,GiftCard,MenuItem,Reservation,OrderItem,Review,Event}