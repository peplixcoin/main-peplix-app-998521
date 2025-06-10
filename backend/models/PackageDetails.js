const mongoose = require('mongoose');

const packageDetailsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, required: false },
    stacking_period: { type: Number, required: false },
    feature1: { type: String, required: false },
    feature2: { type: String, required: false },
    feature3: { type: String, required: false },
    feature4: { type: String, required: false },
    min_tokens_req: { type: Number, required: false },
});

const PackageDetails = mongoose.model('PackageDetails', packageDetailsSchema);

module.exports = PackageDetails;