import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/userSlice';
import './ChatMobileBar.css';
import './ChatLayout.css';

const ChatMobileBar = ({ onToggleSidebar, onNewChat }) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/'); // Redirect to home page after logout
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <header className="chat-mobile-bar">
      <button className="chat-icon-btn" onClick={onToggleSidebar} aria-label="Toggle chat history">☰</button>
      <h1 className="chat-app-title">Chat</h1>
      <div className="chat-menu-container">
        <button className="chat-icon-btn" onClick={onNewChat} aria-label="New chat">＋</button>
        <button 
          className="chat-icon-btn" 
          onClick={() => setShowMenu(!showMenu)} 
          aria-label="Menu"
        >
          ⋮
        </button>
        {showMenu && (
          <div className="chat-menu-dropdown">
            <button onClick={handleHome}>Home</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default ChatMobileBar;