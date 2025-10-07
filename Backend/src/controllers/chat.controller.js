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
            _id: chat._id,
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

// Updated getMessages
async function getMessages(req, res) {
    const user = req.user;
    const { chatId } = req.params; // <- changed to match route

    if (!chatId || chatId === 'undefined') {
        return res.status(400).json({ message: 'Chat ID is required.' });
    }

    try {
        const messages = await messageModel.find({ chat: chatId, user: user._id }).sort({ createdAt: 1 });

        res.status(200).json({
            message: 'Messages fetched successfully',
            messages: messages
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Chat ID format.' });
        }
        res.status(500).json({ message: 'Server error fetching messages.' });
    }
}

// Updated deleteChat
async function deleteChat(req, res) {
    const user = req.user;
    const { chatId } = req.params; // <- changed to match route

    await messageModel.deleteMany({ chat: chatId, user: user._id });
    await chatModel.deleteOne({ _id: chatId, user: user._id });

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
