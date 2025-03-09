import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phonenumber: {
        type: Number,
        reuired: true,
        unique: true,
    },
    name: {
        type: String
    },
    desc: {
        type: String
    },
    joinedOn: {
        type: Date,
        default: Date.now
    },
    plan_type: {
        type: String,
        enum: ['Free', 'Bronze', 'Silver', 'Gold'], // Match case exactly
        default: 'Free'
    },
    plan_expiry: Date,
    payment_history: [{
        date: Date,
        amount: Number,
        plan_type: {
            type: String,
            enum: ['Free', 'Bronze', 'Silver', 'Gold'] // Same enum here
        },
        transaction_id: String,
        invoiceUrl: String
    }],
    planExpiry: Date
});

userSchema.pre('findOneAndUpdate', function (next) {
    this.options.runValidators = true;
    this.options.context = 'query';
    next();
});

export default mongoose.model('User', userSchema);