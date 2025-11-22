const Board = require('../models/Board');
const User = require('../models/User');

// Get all boards for user
exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.userId },
        { 'members.user': req.userId }
      ]
    }).populate('owner', 'name email');

    res.json(boards);
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create board
exports.createBoard = async (req, res) => {
  try {
    const { name, description } = req.body;

    const board = new Board({
      name,
      description,
      owner: req.userId,
      members: [{
        user: req.userId,
        email: req.user.email,
        role: 'owner'
      }],
      lists: [
        { title: 'To Do', cards: [], position: 0 },
        { title: 'In Progress', cards: [], position: 1 },
        { title: 'Done', cards: [], position: 2 }
      ]
    });

    await board.save();
    res.status(201).json(board);
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single board
exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check if user has access
    const hasAccess = board.owner._id.equals(req.userId) || 
      board.members.some(m => m.user && m.user._id.equals(req.userId));

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(board);
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update board
exports.updateBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check permission
    const hasAccess = board.owner.equals(req.userId) || 
      board.members.some(m => m.user && m.user.equals(req.userId));

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update allowed fields
    const { name, description, lists } = req.body;
    if (name) board.name = name;
    if (description !== undefined) board.description = description;
    if (lists) board.lists = lists;

    await board.save();
    res.json(board);
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete board
exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Only owner can delete
    if (!board.owner.equals(req.userId)) {
      return res.status(403).json({ error: 'Only owner can delete board' });
    }

    await board.deleteOne();
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add member
exports.addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check if already a member
    if (board.members.some(m => m.email === email)) {
      return res.status(400).json({ error: 'User already a member' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    board.members.push({
      user: user?._id,
      email,
      role: 'member'
    });

    await board.save();
    res.json(board);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove member
exports.removeMember = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Only owner can remove members
    if (!board.owner.equals(req.userId)) {
      return res.status(403).json({ error: 'Only owner can remove members' });
    }

    board.members = board.members.filter(
      m => m._id.toString() !== req.params.memberId
    );

    await board.save();
    res.json(board);
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add list
exports.addList = async (req, res) => {
  try {
    const { title } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    board.lists.push({
      title,
      cards: [],
      position: board.lists.length
    });

    await board.save();
    res.json(board);
  } catch (error) {
    console.error('Add list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update list
exports.updateList = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const list = board.lists.id(req.params.listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const { title, cards } = req.body;
    if (title) list.title = title;
    if (cards) list.cards = cards;

    await board.save();
    res.json(board);
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete list
exports.deleteList = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    board.lists = board.lists.filter(
      l => l._id.toString() !== req.params.listId
    );

    await board.save();
    res.json(board);
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add card
exports.addCard = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const list = board.lists.id(req.params.listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    list.cards.push({
      title,
      description,
      dueDate,
      createdBy: req.userId
    });

    await board.save();
    res.json(board);
  } catch (error) {
    console.error('Add card error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update card
exports.updateCard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const list = board.lists.id(req.params.listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const card = list.cards.id(req.params.cardId);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const { title, description, dueDate } = req.body;
    if (title) card.title = title;
    if (description !== undefined) card.description = description;
    if (dueDate !== undefined) card.dueDate = dueDate;

    await board.save();
    res.json(board);
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete card
exports.deleteCard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const list = board.lists.id(req.params.listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    list.cards = list.cards.filter(
      c => c._id.toString() !== req.params.cardId
    );

    await board.save();
    res.json(board);
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};