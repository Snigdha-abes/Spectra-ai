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
  io.use(async( socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
    if (!cookies.token) {
      return next(new Error("Authentication error: No token provided"));
    }
    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id); // ✅ await
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
    // const message=  await messageModel.create({
    //     chat: messagePayload.chat,
    //     user: socket.user._id,
    //     content: messagePayload.content, // ✅ use content
    //     role: "user",
    //   });
    //   const vectors=await aiService.generateVector(messagePayload.content)
    //making vectors and creating message simultaneously 
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

    //     const memory=await queryMemory({
    //     queryVector:vectors,
    //     limit:3,
    //     metadata:{
    //       user:socket.user._id
    //     }
    //  })

    //  await createMemory({
    //     vectors,
    //     messsageId:message._id,
    //     metadata:{
    //         chat:messagePayload.chat,
    //         user:socket.user._id, 
    //         text:messagePayload.content
    //     }
    //  })


    
    //   // Fetch chat history (optional)
    //   const chatHistory = (await messageModel.find({
    //      chat: messagePayload.chat 
    //     }).sort({ createdAt: -1 }).limit(20).lean()).reverse();

    //fetch chat history and memory in parallel
    
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
      console.log(ltm[0])
      console.log(stm)

      // Save AI response
      // const responseMessage=await messageModel.create({
      //   chat: messagePayload.chat,
      //   user: socket.user._id,
      //   content: response, // ✅ must be content
      //   role: "model",
      // });
      // const responseVectors=await aiService.generateVector(response)

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

 