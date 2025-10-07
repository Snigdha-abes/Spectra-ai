import React, { useCallback, useEffect, useState } from 'react';
import { io } from "socket.io-client";
import ChatMobileBar from '../components/chat/ChatMobileBar.jsx';
import ChatSidebar from '../components/chat/ChatSidebar.jsx';
import ChatMessages from '../components/chat/ChatMessages.jsx';
import ChatComposer from '../components/chat/ChatComposer.jsx';
import '../components/chat/ChatLayout.css';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  startNewChat,
  selectChat,
  setInput,
  sendingStarted,
  sendingFinished,
  setChats
} from '../store/slices/chatSlice.js';
import toast from 'react-hot-toast';

const Chat = () => {
  const dispatch = useDispatch();
  const chats = useSelector(state => state.chat.chats);
  const activeChatId = useSelector(state => state.chat.activeChatId);
  const input = useSelector(state => state.chat.input);
  const isSending = useSelector(state => state.chat.isSending);
  const [ sidebarOpen, setSidebarOpen ] = React.useState(false);
  const [ socket, setSocket ] = useState(null);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  const [ messages, setMessages ] = useState([]);

  // Handle creating a new chat
  const handleNewChat = async () => {
    // Prompt user for title of new chat, fallback to 'New Chat'
    let title = window.prompt('Enter a title for the new chat:', '');
    if (title) title = title.trim();
    if (!title) return

    const response = await axios.post("http://localhost:3000/api/chat", {
      title
    }, {
      withCredentials: true
    })
    getMessages(response.data.chat._id);
    dispatch(startNewChat(response.data.chat));
    setSidebarOpen(false);
  }

  useEffect(() => {

    //get all chats of the user
    axios.get("http://localhost:3000/api/chat", { withCredentials: true })
      .then(response => {
        dispatch(setChats(response.data.chats.reverse()));
      })

    const tempSocket = io("http://localhost:3000", {
      withCredentials: true,
    })

    tempSocket.on("ai-response", (messagePayload) => {
      // console.log("Received AI response:", messagePayload);

      setMessages((prevMessages) => [ ...prevMessages, {
        type: 'ai',
        content: messagePayload.content
      } ]);

      dispatch(sendingFinished());
    });

    setSocket(tempSocket);

  }, []);

  //emit message to socket server
  const sendMessage = async () => {

    const trimmed = input.trim();
    // console.log("Sending message:", trimmed);
    if (!trimmed || !activeChatId || isSending) return;
    dispatch(sendingStarted());

    const newMessages = [ ...messages, {
      type: 'user',
      content: trimmed
    } ];

    // console.log("New messages:", newMessages);

    setMessages(newMessages);
    dispatch(setInput(''));

    socket.emit("user-message", {
      chat: activeChatId,
      content: trimmed
    })
  }

  const getMessages = async (chatId) => {

   const response = await  axios.get(`http://localhost:3000/api/chat/messages/${chatId}`, { withCredentials: true })

  //  console.log("Fetched messages:", response.data.messages);

   setMessages(response.data.messages.map(m => ({
     type: m.role === 'user' ? 'user' : 'ai',
     content: m.content
   })));

  }

  //delete chat
  const handleDeleteChat = async (chatId) => {
    if (!window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/chat/messages/${chatId}`, { withCredentials: true });
      // Remove the deleted chat from the state
      const updatedChats = chats.filter(chat => chat._id !== chatId);
      dispatch(setChats(updatedChats));

      // If the deleted chat was the active one, clear messages and activeChatId
      if (chatId === activeChatId) {
        setMessages([]);
        dispatch(selectChat(null));
      }
    } catch (error) {
      toast.error("Error deleting chat:", error);
      toast.error("Failed to delete chat. Please try again.");
    }
  };

return (
  <div className="chat-layout minimal">
    <ChatMobileBar
      onToggleSidebar={() => setSidebarOpen(o => !o)}
      onNewChat={handleNewChat}
    />
    <ChatSidebar
      chats={chats}
      activeChatId={activeChatId}
      onSelectChat={(id) => {
        dispatch(selectChat(id));
        setSidebarOpen(false);
        getMessages(id);
      }}
      onNewChat={handleNewChat}
      onDeleteChat={handleDeleteChat}
      open={sidebarOpen}
    />
    <main className="chat-main" role="main">
      {messages.length === 0 && (
        <div className="chat-welcome" aria-hidden="true">
          <div className="chip">Spectra AI Assistant</div>
          <h1>Welcome Back</h1>
          <p>Start a new conversation or continue where you left off</p>
        </div>
      )}
      <ChatMessages messages={messages} isSending={isSending} />
      {
        activeChatId &&
        <ChatComposer
          input={input}
          setInput={(v) => dispatch(setInput(v))}
          onSend={sendMessage}
          isSending={isSending}
        />}
    </main>
    {sidebarOpen && (
      <button
        className="sidebar-backdrop"
        aria-label="Close sidebar"
        onClick={() => setSidebarOpen(false)}
      />
    )}
  </div>
);
};

export default Chat;
