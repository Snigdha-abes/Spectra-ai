import { createSlice, nanoid } from '@reduxjs/toolkit';

const createEmptyChat = (title) => ({ id: nanoid(), title: title || 'New Chat', messages: [] });

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: [],
        activeChatId: null,
        isSending: false,
        input: '',
    },
    reducers: {
        // Add a new chat initially when no chat present
        ensureInitialChat(state) {
            if (state.chats.length === 0) {
                const newChat = createEmptyChat();
                state.chats.unshift(newChat);
                state.activeChatId = newChat.id;
            }
        },
        //create a new chat and set it as active
        startNewChat: {
            reducer(state, action) {
                const { _id, title } = action.payload;
                const newChat = { id: _id || nanoid(), title: title || 'New Chat', messages: [] };
                state.chats.unshift(newChat);
                state.activeChatId = newChat.id;
            }
        },
        // select a particular chat
        selectChat(state, action) {
            state.activeChatId = action.payload;
        },
        setInput(state, action) {
            state.input = action.payload;
        },
        sendingStarted(state) {
            state.isSending = true;
        },
        sendingFinished(state) {
            state.isSending = false;
        },
        setChats(state, action) {
            state.chats = action.payload;
        },
        // add a message to the active chat
        addUserMessage: {
            reducer(state, action) {
                const { chatId, message } = action.payload;
                const chat = state.chats.find(c => c.id === chatId);
                
                if (!chat) return;

                if (chat.messages.length === 0) {
                    chat.title = message.content.slice(0, 20) + (message.content.length > 20 ? '...' : '');
                }

                chat.messages.push(message);
            },
            // prepare function to structure the payload
            prepare(chatId, content) {
                return {
                    payload: {
                        chatId,
                        message: {
                            id: nanoid(),
                            role: 'user',
                            content,
                            ts: new Date().toISOString()
                        }
                    }
                };
            }
        },
        // add a message from the assistant to the active chat
        addAIMessage: {
            // add message to the chat
            reducer(state, action) {
                const { chatId, message } = action.payload;
                const chat = state.chats.find(c => c.id === chatId);
                if (!chat) return;
                chat.messages.push(message);
            },
            // prepare function to structure the payload
            prepare(chatId, content, error=false) {
                return {
                    payload: {
                        chatId,
                        message: {
                            id: nanoid(),
                            role: 'ai',
                            content,
                            ts: new Date().toISOString(),
                            ...(error ? { error: true } : {})
                        }
                    }
                };
            }
        },
    }
});

export const {
    ensureInitialChat,
    startNewChat,
    selectChat,
    setInput,
    sendingStarted,
    sendingFinished,
    setChats,
    addUserMessage,
    addAIMessage
} = chatSlice.actions;

export default chatSlice.reducer;