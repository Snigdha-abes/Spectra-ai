const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const {createMemory,queryMemory}=require("../services/vector.service")
//short term memory me short term bat yad rakhte hai par exact yad rakhte hai
//long term me long term bat yad rakhte hai par exact yad nhi rakhte hai
//vector array of number me convert krke rakhte hai jo k -1 se +1 ke beech me hoti hai
//embedding se vector banta hai
//similarity search se similar vector milta hai
//vector database me vector store krte hai
//ai model me vector feed krke response lete hai
//length can vary like 1024,3072,768,4096,8192,32768 tokens

function initSocketServer(httpserver) {
  const io = new Server(httpserver, {});
//Middleware to authenticate socket connections that only allows authenticated users to connect
  io.use((socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
    if (!cookies.token) {
      return next(new Error("Authentication error: No token provided"));
    }
    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = userModel.findById(decoded.id); // ✅ await
      if (!user) return next(new Error("Authentication error: User not found"));
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ai-message", async (messagePayload) => {
      console.log("Received ai-message:", messagePayload);

      // Save user message
    const message=  await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: messagePayload.content, // ✅ use content
        role: "user",
      });
      const vectors=await aiService.generateVector(messagePayload.content)
           const memory=await queryMemory({
        queryVector:vectors,
        limit:3,
        metadata:{}
     })
     await createMemory({
        vectors,
        messsageId:message._id,
        metadata:{
            chat:messagePayload.chat,
            user:socket.user._id, 
            text:messagePayload.content
        }
     })


    
      // Fetch chat history (optional)
      const chatHistory = (await messageModel.find({
         chat: messagePayload.chat 
        }).sort({ createdAt: -1 }).limit(20).lean()).reverse();
      

      // Generate AI response
      const response = await aiService.generateResponse( chatHistory.map(item => ({
          role: item.role,
          parts: [{ text: item.content }],
        }))); // ✅ use content

      // Save AI response
      const responseMessage=await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: response, // ✅ must be content
        role: "model",
      });
      const responseVectors=await aiService.generateVector(response)
      await createMemory({
        vectors:responseVectors,
        messsageId:responseMessage._id,
        metadata:{
            chat:messagePayload.chat,
            user:socket.user._id,
            text:response
        }
    })

      // Emit response
      socket.emit("ai-response", {
        content: response, // ✅ must be content
        chat: messagePayload.chat,
      });
    });
  });
}

module.exports = initSocketServer;

 