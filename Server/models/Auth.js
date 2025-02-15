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
    }
});

// Check if model already exists before creating
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;