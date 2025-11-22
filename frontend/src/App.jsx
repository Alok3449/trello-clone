import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  Users,
  Brain,
  Calendar,
  TrendingUp,
  LogOut,
  Trash2,
  AlertCircle,
  Menu,
} from "lucide-react";
import { authAPI, boardAPI, recommendationAPI } from "./services/api";

// Login Page Component - RESPONSIVE
const LoginPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await authAPI.login(formData.email, formData.password);
      } else {
        response = await authAPI.register(
          formData.name,
          formData.email,
          formData.password
        );
      }

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      onLogin({ token, user });
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen shrinbg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
          {isLogin ? "Sign In" : "Create Account"}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="John Doe"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 sm:py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm sm:text-base font-medium"
          >
            {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-3 sm:mt-4 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Header Component - RESPONSIVE
const Header = ({ user, onLogout }) => (
  <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex justify-between items-center">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
        Mini Trello
      </h1>
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="text-xs sm:text-sm md:text-base text-gray-700 truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">
          {user.name}
        </span>
        <button
          onClick={onLogout}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-gray-600 hover:text-gray-800 text-xs sm:text-sm md:text-base"
        >
          <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  </header>
);

// Board List Component - RESPONSIVE
const BoardList = ({ boards, onSelectBoard, onCreateBoard, onDeleteBoard }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (newBoardName.trim()) {
      setLoading(true);
      await onCreateBoard(newBoardName.trim());
      setNewBoardName("");
      setShowCreate(false);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
        Your Boards
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {boards.map((board) => (
          <div
            key={board._id}
            className="bg-linear-to-br from-blue-400 to-blue-600 rounded-lg p-4 sm:p-6 cursor-pointer hover:shadow-lg transition group relative min-h-[100px] sm:min-h-[120px]"
          >
            <div onClick={() => onSelectBoard(board)}>
              <h3 className="text-white font-semibold text-base sm:text-lg mb-1 sm:mb-2 wrap-break-word pr-8">
                {board.name}
              </h3>
              <p className="text-blue-100 text-xs sm:text-sm">
                {board.lists?.length || 0} lists
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteBoard(board._id);
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-500 rounded"
            >
              <Trash2 size={14} className="sm:w-4 sm:h-4 text-white" />
            </button>
          </div>
        ))}

        {showCreate ? (
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow">
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="Board name"
              className="w-full px-3 py-2 border border-gray-300 rounded mb-3 text-sm sm:text-base"
              autoFocus
              onKeyPress={(e) => e.key === "Enter" && handleCreate()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
              >
                {loading ? "Creating..." : "Create"}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-gray-200 rounded-lg p-4 sm:p-6 hover:bg-gray-300 transition flex flex-col sm:flex-row items-center justify-center gap-2 min-h-[100px] sm:min-h-[120px]"
          >
            <Plus size={20} className="sm:w-6 sm:h-6 text-gray-600" />
            <span className="text-gray-600 font-medium text-sm sm:text-base">
              Create Board
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

// Board View Component - RESPONSIVE
const BoardView = ({ board, onBack, onUpdate }) => {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, [board]);

  const loadRecommendations = async () => {
    try {
      const response = await recommendationAPI.getRecommendations(board._id);
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error loading recommendations:", error);
    }
  };

  const handleAddList = async (title) => {
    try {
      const response = await boardAPI.addList(board._id, title);
      onUpdate(response.data);
    } catch (error) {
      console.error("Error adding list:", error);
    }
  };

  const handleUpdateList = async (listId, updates) => {
    try {
      const response = await boardAPI.updateList(board._id, listId, updates);
      onUpdate(response.data);
      loadRecommendations();
    } catch (error) {
      console.error("Error updating list:", error);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      const response = await boardAPI.deleteList(board._id, listId);
      onUpdate(response.data);
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  const handleAddCard = async (listId, cardData) => {
    try {
      const response = await boardAPI.addCard(board._id, listId, cardData);
      onUpdate(response.data);
      loadRecommendations();
    } catch (error) {
      console.error("Error adding card:", error);
    }
  };

  const handleUpdateCard = async (listId, cardId, updates) => {
    try {
      const response = await boardAPI.updateCard(
        board._id,
        listId,
        cardId,
        updates
      );
      onUpdate(response.data);
      loadRecommendations();
    } catch (error) {
      console.error("Error updating card:", error);
    }
  };

  const handleDeleteCard = async (listId, cardId) => {
    try {
      const response = await boardAPI.deleteCard(board._id, listId, cardId);
      onUpdate(response.data);
      loadRecommendations();
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  const handleInvite = async (email) => {
    try {
      const response = await boardAPI.addMember(board._id, email);
      onUpdate(response.data);
      setShowInvite(false);
    } catch (error) {
      console.error("Error inviting member:", error);
      alert(error.response?.data?.error || "Failed to invite member");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-57px)] sm:h-[calc(100vh-65px)] md:h-[calc(100vh-73px)]">
      {/* Main Content Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="p-3 sm:p-4 md:p-6">
          {/* Board Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800 text-sm sm:text-base shrink-0"
              >
                ← Back
              </button>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">
                {board.name}
              </h2>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setShowInvite(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-xs sm:text-sm"
              >
                <Users size={14} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Invite</span>
              </button>
              <button
                onClick={() => setShowRecommendations(!showRecommendations)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm ${
                  showRecommendations
                    ? "bg-purple-600 text-white"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Brain size={14} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Recommendations</span>
                <span className="sm:hidden">({recommendations.length})</span>
                <span className="hidden sm:inline">({recommendations.length})</span>
              </button>
            </div>
          </div>

          {/* Lists Container */}
          <div className="flex gap-3 sm:gap-4 pb-4 overflow-x-auto">
            {board.lists?.map((list) => (
              <List
                key={list._id}
                list={list}
                onUpdate={(updates) => handleUpdateList(list._id, updates)}
                onDelete={() => handleDeleteList(list._id)}
                onAddCard={(card) => handleAddCard(list._id, card)}
                onUpdateCard={(cardId, updates) =>
                  handleUpdateCard(list._id, cardId, updates)
                }
                onDeleteCard={(cardId) => handleDeleteCard(list._id, cardId)}
              />
            ))}
            <AddListButton onAdd={handleAddList} />
          </div>
        </div>
      </div>

      {/* Recommendations Sidebar - Responsive */}
      {showRecommendations && (
        <>
          {/* Mobile: Full Screen Overlay */}
          <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="text-purple-600" size={24} />
                <h3 className="text-lg font-semibold">Recommendations</h3>
              </div>
              <button
                onClick={() => setShowRecommendations(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <RecommendationsContent recommendations={recommendations} />
            </div>
          </div>

          {/* Desktop: Sidebar */}
          <div className="hidden md:block w-80 lg:w-96 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4 sticky top-0 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="text-purple-600" size={24} />
                  <h3 className="text-lg font-semibold">Smart Recommendations</h3>
                </div>
                <button
                  onClick={() => setShowRecommendations(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <RecommendationsContent recommendations={recommendations} />
            </div>
          </div>
        </>
      )}

      {showInvite && (
        <InviteModal
          board={board}
          onClose={() => setShowInvite(false)}
          onInvite={handleInvite}
        />
      )}
    </div>
  );
};

// List Component - RESPONSIVE
const List = ({
  list,
  onUpdate,
  onDelete,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
}) => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title);

  const handleTitleSave = () => {
    if (title.trim() && title !== list.title) {
      onUpdate({ title: title.trim() });
    }
    setEditing(false);
  };

  return (
    <div className="bg-gray-200 rounded-lg p-2 sm:p-3 w-64 sm:w-72 md:w-80 shrink-0">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        {editing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyPress={(e) => e.key === "Enter" && handleTitleSave()}
            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm sm:text-base"
            autoFocus
          />
        ) : (
          <h3
            onClick={() => setEditing(true)}
            className="font-semibold text-gray-800 cursor-pointer flex-1 text-sm sm:text-base wrap-break-word"
          >
            {list.title}
          </h3>
        )}
        <button
          onClick={onDelete}
          className="text-gray-500 hover:text-red-600 p-1 ml-2 shrink-0"
        >
          <Trash2 size={14} className="sm:w-4 sm:h-4" />
        </button>
      </div>

      <div className="space-y-2 mb-2 max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-300px)] overflow-y-auto">
        {list.cards?.map((card) => (
          <Card
            key={card._id}
            card={card}
            onUpdate={(updates) => onUpdateCard(card._id, updates)}
            onDelete={() => onDeleteCard(card._id)}
          />
        ))}
      </div>

      {showAddCard ? (
        <AddCard
          onAdd={(card) => {
            onAddCard(card);
            setShowAddCard(false);
          }}
          onCancel={() => setShowAddCard(false)}
        />
      ) : (
        <button
          onClick={() => setShowAddCard(true)}
          className="w-full text-left px-2 py-2 text-gray-600 hover:bg-gray-300 rounded text-sm sm:text-base"
        >
          + Add a card
        </button>
      )}
    </div>
  );
};

// Card Component - RESPONSIVE
const Card = ({ card, onUpdate, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <>
      <div
        onClick={() => setShowDetails(true)}
        className="bg-white rounded p-2 sm:p-3 shadow-sm hover:shadow-md cursor-pointer group"
      >
        <div className="flex justify-between items-start gap-2">
          <p className="text-gray-800 flex-1 text-sm sm:text-base wrap-break-word">
            {card.title}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 shrink-0"
          >
            <X size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
        {card.dueDate && (
          <div
            className={`flex items-center gap-1 mt-2 text-xs ${
              isOverdue ? "text-red-600 font-semibold" : "text-gray-600"
            }`}
          >
            <Calendar size={10} className="sm:w-3 sm:h-3" />
            <span className="text-[10px] sm:text-xs">
              {new Date(card.dueDate).toLocaleDateString()}
              {isOverdue && " (Overdue)"}
            </span>
          </div>
        )}
      </div>

      {showDetails && (
        <CardDetailsModal
          card={card}
          onClose={() => setShowDetails(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
};

// Add Card Component - RESPONSIVE
const AddCard = ({ onAdd, onCancel }) => {
  const [title, setTitle] = useState("");

  const handleAdd = () => {
    if (title.trim()) {
      onAdd({ title: title.trim(), description: "" });
      setTitle("");
    }
  };

  return (
    <div className="bg-white rounded p-2 sm:p-3 shadow">
      <textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter card title..."
        className="w-full px-2 py-1 border border-gray-300 rounded mb-2 resize-none text-sm sm:text-base"
        rows="3"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          className="px-3 sm:px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base"
        >
          Add
        </button>
        <button
          onClick={onCancel}
          className="px-3 sm:px-4 py-1 text-gray-600 hover:text-gray-800"
        >
          <X size={16} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

// Add List Button - RESPONSIVE
const AddListButton = ({ onAdd }) => {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");

  const handleAdd = () => {
    if (title.trim()) {
      onAdd(title.trim());
      setTitle("");
      setShow(false);
    }
  };

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="bg-gray-300 bg-opacity-50 rounded-lg p-2 sm:p-3 w-64 sm:w-72 md:w-80 shrink-0 hover:bg-opacity-70 h-fit"
      >
        <span className="text-gray-700 text-sm sm:text-base">+ Add another list</span>
      </button>
    );
  }

  return (
    <div className="bg-gray-200 rounded-lg p-2 sm:p-3 w-64 sm:w-72 md:w-80 shrink-0">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter list title..."
        className="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-sm sm:text-base"
        autoFocus
        onKeyPress={(e) => e.key === "Enter" && handleAdd()}
      />
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          className="px-3 sm:px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base"
        >
          Add
        </button>
        <button
          onClick={() => setShow(false)}
          className="px-3 sm:px-4 py-1 text-gray-600 hover:text-gray-800"
        >
          <X size={16} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

// Card Details Modal - RESPONSIVE
const CardDetailsModal = ({ card, onClose, onUpdate }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [dueDate, setDueDate] = useState(
    card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : ""
  );

  const handleSave = () => {
    onUpdate({ title, description, dueDate: dueDate || null });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4 gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg sm:text-xl font-semibold flex-1 px-2 py-1 border border-gray-300 rounded"
            />
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 shrink-0"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded resize-none text-sm sm:text-base"
              rows="6"
              placeholder="Add a more detailed description..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded text-sm sm:text-base"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded sm:border-0 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  };

// Invite Modal - RESPONSIVE
const InviteModal = ({ board, onClose, onInvite }) => {
  const [email, setEmail] = useState("");

  const handleInvite = () => {
    if (email.trim() && email.includes("@")) {
      onInvite(email.trim());
      setEmail("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-4 sm:p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-semibold">Invite to Board</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm sm:text-base"
            onKeyPress={(e) => e.key === "Enter" && handleInvite()}
          />
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Current Members:
          </p>
          <div className="space-y-1 max-h-32 sm:max-h-40 overflow-y-auto">
            {board.members?.map((member, idx) => (
              <div
                key={idx}
                className="text-xs sm:text-sm text-gray-600 flex items-center gap-2 py-1"
              >
                <Users size={12} className="sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate flex-1">{member.email}</span>
                {member.role === "owner" && (
                  <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded shrink-0">
                    Owner
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded sm:border-0 text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleInvite}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base"
          >
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
};

// Recommendations Content Component - RESPONSIVE (Reusable for mobile and desktop)
const RecommendationsContent = ({ recommendations }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "text-red-700 bg-red-50 border-red-300";
      case "high":
        return "text-orange-700 bg-orange-50 border-orange-300";
      case "medium":
        return "text-yellow-700 bg-yellow-50 border-yellow-300";
      case "low":
        return "text-blue-700 bg-blue-50 border-blue-300";
      default:
        return "text-gray-700 bg-gray-50 border-gray-300";
    }
  };

  const getIcon = (type) => {
    const iconSize = 16;
    switch (type) {
      case "dueDate":
        return <Calendar className="shrink-0 mt-1" size={iconSize} />;
      case "move":
        return <TrendingUp className="shrink-0 mt-1" size={iconSize} />;
      case "related":
        return <Brain className="shrink-0 mt-1" size={iconSize} />;
      case "overdue":
        return <AlertCircle className="shrink-0 mt-1" size={iconSize} />;
      case "attention":
        return <AlertCircle className="shrink-0 mt-1" size={iconSize} />;
      default:
        return <Brain className="shrink-0 mt-1" size={iconSize} />;
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <Brain className="mx-auto text-gray-300 mb-3" size={48} />
        <p className="text-gray-500 text-sm">
          No recommendations at this time. Add more cards with descriptions to
          get smart suggestions!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec, idx) => (
        <div
          key={idx}
          className={`rounded-lg p-3 border ${getPriorityColor(rec.priority)}`}
        >
          <div className="flex items-start gap-2">
            {getIcon(rec.type)}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm wrap-break-word">{rec.cardTitle}</p>

              {rec.type === "move" && (
                <p className="text-xs mt-1 opacity-75">From: {rec.currentList}</p>
              )}

              {rec.type === "related" && (
                <p className="text-xs mt-1 opacity-75 wrap-break-word">
                  ↔ {rec.relatedCardTitle}
                </p>
              )}

              <p className="text-xs mt-1 wrap-break-word">{rec.reason}</p>
              <p className="text-xs font-medium mt-1 wrap-break-word">
                💡 {rec.suggestion}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Recommendations Panel - RESPONSIVE (Desktop only, mobile uses overlay)
const RecommendationsPanel = ({ recommendations }) => {
  return (
    <div className="w-80 lg:w-96 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="text-purple-600" size={24} />
        <h3 className="text-lg font-semibold">Smart Recommendations</h3>
      </div>
      <RecommendationsContent recommendations={recommendations} />
    </div>
  );
};

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      loadBoards();
    } else {
      setLoading(false);
    }
  }, []);

  const loadBoards = async () => {
    try {
      const response = await boardAPI.getBoards();
      setBoards(response.data);
      setUser({ token: localStorage.getItem("token") });
    } catch (error) {
      console.error("Error loading boards:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    loadBoards();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setBoards([]);
    setSelectedBoard(null);
  };

  const handleCreateBoard = async (name) => {
    try {
      const response = await boardAPI.createBoard({ name });
      setBoards([...boards, response.data]);
    } catch (error) {
      console.error("Error creating board:", error);
    }
  };

  const handleDeleteBoard = async (id) => {
    if (window.confirm("Are you sure you want to delete this board?")) {
      try {
        await boardAPI.deleteBoard(id);
        setBoards(boards.filter((b) => b._id !== id));
        if (selectedBoard?._id === id) {
          setSelectedBoard(null);
        }
      } catch (error) {
        console.error("Error deleting board:", error);
        alert("Failed to delete board");
      }
    }
  };

  const handleSelectBoard = async (board) => {
    try {
      const response = await boardAPI.getBoard(board._id);
      setSelectedBoard(response.data);
    } catch (error) {
      console.error("Error loading board:", error);
    }
  };

  const handleUpdateBoard = (updatedBoard) => {
    setSelectedBoard(updatedBoard);
    setBoards(
      boards.map((b) => (b._id === updatedBoard._id ? updatedBoard : b))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg sm:text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} onLogout={handleLogout} />
      {!selectedBoard ? (
        <BoardList
          boards={boards}
          onSelectBoard={handleSelectBoard}
          onCreateBoard={handleCreateBoard}
          onDeleteBoard={handleDeleteBoard}
        />
      ) : (
        <BoardView
          board={selectedBoard}
          onBack={() => setSelectedBoard(null)}
          onUpdate={handleUpdateBoard}
        />
      )}
    </div>
  );
}

export default App;