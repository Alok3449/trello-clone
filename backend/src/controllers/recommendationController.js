const Board = require('../models/Board');

exports.getRecommendations = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const recommendations = [];

    // Analyze all cards for recommendations
    board.lists.forEach(list => {
      list.cards.forEach(card => {
        
        // URGENT KEYWORDS - Due date recommendations
        if (!card.dueDate) {
          const urgentWords = ['urgent', 'asap', 'immediately', 'critical', 'deadline', 'priority', 'important'];
          const cardText = (card.title + ' ' + (card.description || '')).toLowerCase();
          const isUrgent = urgentWords.some(word => cardText.includes(word));
          
          if (isUrgent) {
            const daysAhead = 2;
            const suggestedDate = new Date();
            suggestedDate.setDate(suggestedDate.getDate() + daysAhead);
            
            recommendations.push({
              type: 'dueDate',
              cardId: card._id.toString(),
              listId: list._id.toString(),
              cardTitle: card.title,
              suggestion: `Set due date to ${suggestedDate.toLocaleDateString()}`,
              reason: 'Contains urgent keywords',
              priority: 'high'
            });
          } else {
            // TIME-RELATED PHRASES
            const weekWords = ['this week', 'next week', 'by friday', 'by monday', 'by weekend'];
            const hasWeekMention = weekWords.some(word => cardText.includes(word));
            
            if (hasWeekMention) {
              recommendations.push({
                type: 'dueDate',
                cardId: card._id.toString(),
                listId: list._id.toString(),
                cardTitle: card.title,
                suggestion: 'Set due date within 7 days',
                reason: 'Contains time-related phrases',
                priority: 'medium'
              });
            }
          }
        }

        // PROGRESS DETECTION - List movement recommendations
        const progressWords = ['started', 'working on', 'in progress', 'doing', 'began', 'beginning', 'currently'];
        const doneWords = ['completed', 'finished', 'done', 'resolved', 'closed', 'fixed', 'implemented'];
        const blockedWords = ['blocked', 'stuck', 'waiting', 'pending', 'issue', 'problem', 'need help'];

        const cardText = (card.title + ' ' + (card.description || '')).toLowerCase();
        const listTitleLower = list.title.toLowerCase().replace(/\s+/g, ''); // Remove spaces for better matching

        // Check if in "To Do" type lists
        if (listTitleLower.includes('todo') || listTitleLower.includes('backlog') || list.title === 'To Do') {
          if (progressWords.some(word => cardText.includes(word))) {
            recommendations.push({
              type: 'move',
              cardId: card._id.toString(),
              listId: list._id.toString(),
              cardTitle: card.title,
              currentList: list.title,
              suggestion: 'Move to In Progress',
              reason: 'Description indicates work has started',
              priority: 'high'
            });
          }
        }

        // Check if in "In Progress" type lists
        if (listTitleLower.includes('progress') || list.title === 'In Progress') {
          if (doneWords.some(word => cardText.includes(word))) {
            recommendations.push({
              type: 'move',
              cardId: card._id.toString(),
              listId: list._id.toString(),
              cardTitle: card.title,
              currentList: list.title,
              suggestion: 'Move to Done',
              reason: 'Description indicates completion',
              priority: 'high'
            });
          }
          
          if (blockedWords.some(word => cardText.includes(word))) {
            recommendations.push({
              type: 'attention',
              cardId: card._id.toString(),
              listId: list._id.toString(),
              cardTitle: card.title,
              suggestion: 'Card may be blocked - needs attention',
              reason: 'Contains blocking keywords',
              priority: 'high'
            });
          }
        }

        // OVERDUE CARDS
        if (card.dueDate && new Date(card.dueDate) < new Date()) {
          const isDone = list.title.toLowerCase().includes('done') || 
                        list.title.toLowerCase().includes('complete');
          
          if (!isDone) {
            const daysOverdue = Math.floor((new Date() - new Date(card.dueDate)) / (1000 * 60 * 60 * 24));
            recommendations.push({
              type: 'overdue',
              cardId: card._id.toString(),
              listId: list._id.toString(),
              cardTitle: card.title,
              suggestion: 'This card is overdue',
              reason: `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} past due date`,
              priority: 'critical'
            });
          }
        }
      });
    });

    // RELATED CARDS - Find cards with similar content
    const allCards = board.lists.flatMap(l => 
      l.cards.map(c => ({ 
        ...c.toObject(), 
        listId: l._id,
        listTitle: l.title 
      }))
    );

    // Stop words to ignore
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                       'of', 'with', 'by', 'from', 'this', 'that', 'these', 'those'];

    for (let i = 0; i < allCards.length; i++) {
      for (let j = i + 1; j < allCards.length; j++) {
        const card1 = allCards[i];
        const card2 = allCards[j];

        // Skip if same list
        if (card1.listId.equals(card2.listId)) continue;

        const text1 = (card1.title + ' ' + (card1.description || '')).toLowerCase();
        const text2 = (card2.title + ' ' + (card2.description || '')).toLowerCase();

        // Get meaningful words (length >= 4 OR exactly 4-letter important words)
        const words1 = text1.split(/\s+/)
          .filter(w => w.length >= 4 && !stopWords.includes(w))
          .filter(w => /^[a-z]+$/.test(w)); // Only alphabetic words

        const words2 = text2.split(/\s+/)
          .filter(w => w.length >= 4 && !stopWords.includes(w))
          .filter(w => /^[a-z]+$/.test(w));

        const commonWords = words1.filter(w => words2.includes(w));

        // Need at least 2 common meaningful words
        if (commonWords.length >= 2) {
          recommendations.push({
            type: 'related',
            cardId: card1._id.toString(),
            relatedCardId: card2._id.toString(),
            listId: card1.listId.toString(),
            relatedListId: card2.listId.toString(),
            cardTitle: card1.title,
            relatedCardTitle: card2.title,
            suggestion: 'These cards may be related',
            reason: `Common themes: ${commonWords.slice(0, 3).join(', ')}`,
            priority: 'low'
          });
        }
      }
    }

    // Sort recommendations by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    res.json(recommendations);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};