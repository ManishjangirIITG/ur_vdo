import mongoose from "mongoose"

// videofile.js
const videoSchema = new mongoose.Schema({
  videotitle: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  filename: {
    type: String,
    required: true,
    unique: true // Ensure unique filenames
  },
  filepath: {
    type: String,
    required: true
  },
  filetype: {
    type: String,
    required: true
  },
  filesize: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videochanel: {
    type: String,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model("VideoFile", videoSchema)