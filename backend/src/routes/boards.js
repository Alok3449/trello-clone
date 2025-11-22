const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const boardController = require('../controllers/boardController');

// All routes require authentication
router.use(auth);

// Board routes
router.get('/', boardController.getBoards);
router.post('/', boardController.createBoard);
router.get('/:id', boardController.getBoard);
router.put('/:id', boardController.updateBoard);
router.delete('/:id', boardController.deleteBoard);

// Member routes
router.post('/:id/members', boardController.addMember);
router.delete('/:id/members/:memberId', boardController.removeMember);

// List routes
router.post('/:id/lists', boardController.addList);
router.put('/:id/lists/:listId', boardController.updateList);
router.delete('/:id/lists/:listId', boardController.deleteList);

// Card routes
router.post('/:id/lists/:listId/cards', boardController.addCard);
router.put('/:id/lists/:listId/cards/:cardId', boardController.updateCard);
router.delete('/:id/lists/:listId/cards/:cardId', boardController.deleteCard);

module.exports = router;