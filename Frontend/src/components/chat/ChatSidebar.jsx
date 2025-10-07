import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/userSlice';
import './ChatSidebar.css';

const ChatSidebar = ({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, open }) => {
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
    <aside className={"chat-sidebar " + (open ? 'open' : '')} aria-label="Previous chats">
      <div className="sidebar-header">
        <button className="new-chat-button" onClick={onNewChat}>New Chat</button>
        <div className="sidebar-menu">
          <button className="menu-button" onClick={handleHome}>Home</button>
          <button className="menu-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <nav className="chat-list" aria-live="polite">
        {chats.map(c => {
          // ▼▼▼ ADD THIS LINE TO DEBUG ▼▼▼
          console.log("Inspecting chat data:", c);
          // ▲▲▲ ADD THIS LINE TO DEBUG ▲▲▲

          return (
            <div key={c._id} className="chat-item-wrapper">
              <button
                className={"chat-list-item " + (c._id === activeChatId ? 'active' : '')}
                onClick={() => onSelectChat(c._id)}
              >
                <span className="title-line">{c.title}</span>
              </button>
              <button
                className="delete-chat-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(c._id);
                }}
                title="Delete chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          )
        })}
        {chats.length === 0 && <p className="empty-hint">No chats yet.</p>}
      </nav>
    </aside>
  );
};

export default ChatSidebar;