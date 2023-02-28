const utils = require("./utils/socket");
const uniqueID = require("uniqid");
const moment = require("moment");
const app = require("express")();
var http = require("http");
const serverFile = require("./server");
const { Server } = require("socket.io");
const server = http.createServer(app);

const dotenv = require("dotenv");

dotenv.config({
  path: "./config.env"
});

const Chat = require("./models/chatModel");

server.listen(process.env.SOCKET_PORT, () => {
  console.log(`listening on *:${process.env.SOCKET_PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3001", "http://localhost:3000"],
    optionsSuccessStatus: 200, // For legacy browser support
    methods: "GET, PUT, POST, DELETE"
  }
});

require("./globals");
// This is our socket server. All the events socket events will go here.
// Export the socket server
//module.exports = (io, app) => {
io.on("connection", async socket => {
  let windowID = socket;

  console.log("connected", socket.id);
  socket.emit("wait", {
    message: "Please wait...connecting you to stranger!"
  });
  //push the user to avilable users list
  availableUsers.push(socket);
  console.log("AFTER PUSHING AVAILABLE USER:", availableUsers.length);
  let resolveAfter5Seconds = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve("resolved");
      }, 5000);
    });
  };
  async function asyncCall() {
    let result = await resolveAfter5Seconds();
    //get index of randomly selected user from the available users list
    console.log(availableUsers.length);

    let selected = Math.floor(Math.random() * availableUsers.length);
    //store the user in Socket
    socket = availableUsers[selected];
    //remove the randomly selected user from the available users list
    availableUsers.splice(selected, 1);

    // Make a user object and add it to the onlineUsers list and rooms too(maybe we can add to room once we have the partner.)

    // create an unique id here.
    // let uID = uniqueID();
    // console.log(uID);
    // rooms.push({ "roomID": uID, "isFilled": false });
    // // Maintain a global room array which would store the room ids.
    // socket.join(uID);
    // // emit the room id to the frontend side.
    // socket.emit('private ack', { "message": "Added to privateRoom", "roomID": uID });
    socket.emit("ack", { id: socket.id, msg: "User connected" });
    onlineUsers.push(socket);

    socket.on("privateRoom", user => {
      let unfilledRooms = rooms.filter(room => {
        if (!room.isFilled) {
          return room;
        }
      });
      try {
        console.log(unfilledRooms[0]);
        // join the existing room.
        socket.join(unfilledRooms[0].roomID);
        let index = rooms.indexOf(unfilledRooms[0]);
        rooms[index].isFilled = true;
        unfilledRooms[0].isFilled = true;
        socket.emit("private ack", {
          message: "Added to privateRoom",
          roomID: unfilledRooms[0].roomID
        });
        socket.roomID = unfilledRooms[0].roomID;
        io.sockets
          .in(socket.roomID)
          .emit("toast", { message: "You are connected with a stranger!" });
        socket.emit("init-call", { pId: unfilledRooms[0].peerId });
      } catch (e) {
        console.log("CREATED ROOM");
        // dont have unfilled rooms. Thus creating a new user.
        let uID = uniqueID();
        console.log("PEERID:", user.peerId);
        rooms.push({ roomID: uID, isFilled: false, peerId: user.peerId });
        socket.join(uID);
        socket.roomID = uID;
        socket.emit("private ack", {
          message: "Added to privateRoom",
          roomID: uID
        });
      }
    });
  }
  asyncCall();

  socket.on("sendMessage", data => {
    let timeStamp = moment().format("LT");
    io.sockets.in(data.room).emit("newMessage", {
      message: data,
      senderId: windowID.id,
      timeStamp: timeStamp
    });
  });

  socket.on("typing", data => {
    io.sockets.in(data.room).emit("addTyping", {
      senderId: windowID.id,
      typingStatus: data.typingStatus
    });
  });

  // Disconnect the user
  socket.on("disconnect", () => {
    let index = onlineUsers.indexOf(socket);
    onlineUsers.splice(index, 1);
    index = rooms.findIndex(x => x.roomID == windowID.roomID);
    if (index >= 0) {
      if (rooms[index].isFilled == true) {
        let warning = {
          title: "Stranger is disconnected!",
          message: "Please click on 'New' button to connect to someone else."
        };
        io.sockets
          .in(windowID.roomID)
          .emit("alone", { warning: warning, roomID: windowID.roomID });
        rooms.splice(index, 1);
      } else {
        rooms.splice(index, 1);
      }
    }
  });
});
//};

/*

io.on("connection", async socket => {
  // setInterval(() => server.emit("transaction-released", "Hi"), 5000);
  // io.emit("transaction-released", "hi");
  socket.on("send-chat-payload", async msg => {
    serverFile.mongoConnection;
    try {
      const chat = await Chat.create({
        message: msg.message,
        sender: msg.senderID,
        time: msg.time,
        receiver: msg.receiverID,
        transaction: msg.transactionId
      });

      return io.emit("receive-chat-message", [chat]);
    } catch (error) {
      console.log(error);
    }
  });
});
*/
app.set("io", io);

exports.module = server;
module.exports.io = io;
