const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

async function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
      allowedHeaders: [ "Content-Type", "Authorization" ],
    }
  });

  // Middlware to ensure that the socket connection is established only for authenticated users
  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
    const token = cookies.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await userModel.findById(decoded.id);

      socket.user = user;

      next();
    } catch (error) {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    // console.log(`User connected: ${socket.user.email}`);
    socket.on("user-message", async (messagePayload) => {
      /*
      messagePayload: {
        chat: "chat_id",
        content: "user message"
      }
      */
    //  console.log("Message payload received:", messagePayload);

      const [message, vectors] = await Promise.all([
        //store user message in mongodb
        messageModel.create({
          user: socket.user._id,
          chat: messagePayload.chat,
          content: messagePayload.content,
          role: "user",
        }),

        //generate vector for the user message
        aiService.generateVector(messagePayload.content),
      ]);

      //store the user message vector in pinecone
      await createMemory({
        messageID: message._id,
        vectors,
        metadata: {
          user: socket.user._id,
          chat: messagePayload.chat,
          text: messagePayload.content,
        },
      });

      const [memory, chatHistory] = await Promise.all([
        //query pinecone i.e. vector database for related memories/vectors
        queryMemory({
          queryVector: vectors,
          limit: 3,
          metadata: {
            user: { $eq: socket.user._id },
          },
        }),
        //get last 20 messages for the current chat from mongodb
        messageModel
          .find({
            chat: messagePayload.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
          .then((messages) => messages.reverse()),
      ]);

      //short term memory
      const stm = chatHistory.map((item) => {
        return {
          role: item.role,
          parts: [{ text: item.content }],
        };
      });

      //long term memory
      const ltm = [
        {
          role: "user",
          parts: [
            {
              text: `
            These are some previous conversations you had with the user, use them to generate the response

            ${memory.map((item) => item.metadata.text).join("\n")}
          `,
            },
          ],
        },
      ];

      const response = await aiService.generateResponse([...ltm, ...stm]);

      // Emit the AI response back to the user
      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });

      const [responseMessage, responseVectors] = await Promise.all([
        // Store the AI response message in MongoDB
        messageModel.create({
          chat: messagePayload.chat,
          user: socket.user._id,
          content: response,
          role: "model",
        }),

        // Generate vector for the AI response
        aiService.generateVector(response),
      ]);

      // Store the AI response vector in Pinecone
      await createMemory({
        messageID: responseMessage._id,
        vectors: responseVectors,
        metadata: {
          user: socket.user._id,
          chat: messagePayload.chat,
          text: response,
        },
      });
    });
  });
}

module.exports = initSocketServer;