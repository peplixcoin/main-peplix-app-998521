require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const path = require('path'); // Import path module

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// CORS configuration (optional, adjust based on needs)
app.use(cors({
    origin: [
        'https://stocklinkinvest.vercel.app',
        'https://main-peplix-app-998521.onrender.com',
        'http://localhost:3000',
        'http://localhost:3001',
        'https://peplixcoin.vercel.app'
    ],
    credentials: true // If you're using cookies for auth
}));

app.use(cookieParser());

// Routes
app.use('/api/users', userRoutes);

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, 'build')));



// Server
const PORT =  5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));