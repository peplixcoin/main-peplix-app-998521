const mongoose = require('mongoose');

const termsSchema = new mongoose.Schema({
    paragraph: {
        type: String,
        required: true
    }
});

// Create a model based on the schema
const Terms = mongoose.model('Terms', termsSchema);

module.exports = Terms;