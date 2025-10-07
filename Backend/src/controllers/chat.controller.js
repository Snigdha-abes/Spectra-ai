const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');

async function createChat(req, res) {
    const { title } = req.body;
    const user = req.user;

    const chat = await chatModel.create({
        user: user._id,
        title,
    });

    res.status(201).json({
        message: 'Chat created successfully',
        chat: {
            id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user,
        }
    })
}

async function getChats(req, res) {
    const user = req.user;

    const chats = await chatModel.find({ user: user._id }).sort({ lastActivity: 1 });

    res.status(200).json({
        message: 'Chats fetched successfully',
        chats: chats.map(chat => ({
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user,
        }))
    })
}

// In src/controllers/chat.controller.js

async function getMessages(req, res) {
    const user = req.user;
    const { id } = req.params;

    // --- SOLUTION ---
    // Add this validation check at the top
    if (!id || id === 'undefined') {
        return res.status(400).json({ message: 'Chat ID is required.' });
    }
    // --- END SOLUTION ---

    try {
        const messages = await messageModel.find({ chat: id, user: user._id }).sort({ createdAt: 1 });

        res.status(200).json({
            message: 'Messages fetched successfully',
            messages: messages
        });
    } catch (error) {
        // Handle potential cast errors if an invalid ID format is still passed
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Chat ID format.' });
        }
        res.status(500).json({ message: 'Server error fetching messages.' });
    }
}

async function deleteChat(req, res) {
    const user = req.user;
    const { id } = req.params;

    // Delete all messages associated with the chat
    await messageModel.deleteMany({ chat: id, user: user._id });

    // Delete the chat
    await chatModel.deleteOne({ _id: id, user: user._id });

    res.status(200).json({
        message: 'Chat and associated messages deleted successfully'
    });
}

module.exports = {
    createChat,
    getChats,
    getMessages,
    deleteChat
};