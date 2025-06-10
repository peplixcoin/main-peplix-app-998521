require('dotenv').config();  // Load environment variables from .env file
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');  // Adjust the path to your User model

// Connect to MongoDB using MONGO_URI from .env
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Create Grand Director
async function createGrandDirector() {
    try {
        // Check if the Grand Director already exists
        const existingUser = await User.findOne({ username: 'GrandDirector' });
        if (existingUser) {
         
            return;
        }

        // Hash the password for the Grand Director using bcrypt
        const hashedPassword = await bcrypt.hash('Grand@007', 10);  // Replace with your desired password

        // Create the Grand Director user document
        const grandDirector = new User({
            username: 'GrandDirector',
            email: 'taufeeqsyed62@gmail.com',
            password: hashedPassword,
            phoneNumber: '7666132393',
            level: 0,
            wallet: 0,
            walletrecord: 0,
            totalAmountInvested: 0,
            tokenWallet: 0,
            packages: [],
            sponsor: null,  // No sponsor for the Grand Director
            referrals: []   // Empty referrals array
        });

        // Save the Grand Director to the database
        await grandDirector.save();
        
    } catch (error) {
        console.error('Error creating Grand Director:', error);
    } finally {
        mongoose.connection.close();  // Close the connection after script finishes
    }
}

// Run the function to create Grand Director
createGrandDirector();
