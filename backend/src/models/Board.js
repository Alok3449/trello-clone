const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  dueDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  cards: [cardSchema],
  position: {
    type: Number,
    default: 0
  }
});

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: String,
    role: {
      type: String,
      enum: ['owner', 'member'],
      default: 'member'
    }
  }],
  lists: [listSchema],
  background: {
    type: String,
    default: 'blue'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Board', boardSchema);