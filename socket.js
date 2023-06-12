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
    origin: ["http://localhost:5173", "http://localhost:3000"],
    optionsSuccessStatus: 200, // For legacy browser support
    methods: "GET, PUT, POST, DELETE"
  }
});

require("./globals");
let availableUsers = [];
// This is our socket server. All the events socket events will go here.
// Export the socket server
//module.exports = (io, app) => {
io.on("connection", async socket => {
  let windowID = socket;

  socket.on("setUserData", userData => {
    windowID.userData = userData;
    windowID.emit("wait", {
      message: "Please wait...connecting you to stranger!"
    });

    console.log("HERE:", availableUsers);
    const filteredUsers = availableUsers.filter(
      user => user.userData.id === userData?.id
    );
    if (filteredUsers.length > 0) console.log("User Already exists");
    //push the user to avilable users list
    availableUsers.push({ socket: windowID, userData: userData });
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
      console.log("SELECTED:", availableUsers[selected].userData);
      socket = availableUsers[selected].socket;

      //remove the randomly selected user from the available users list
      availableUsers.splice(selected, 1);

      socket.emit("ack", {
        id: socket.id,
        userData: userData,
        msg: "User connected"
      });
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
          if (unfilledRooms[0].roomID === userData?.id) return;
          socket.join(unfilledRooms[0].roomID);
          let index = rooms.indexOf(unfilledRooms[0]);
          rooms[index].isFilled = true;
          rooms[index].user2 = userData;
          unfilledRooms[0].isFilled = true;
          socket.emit("private ack", {
            message: "Added to privateRoom",
            roomID: unfilledRooms[0].roomID
          });
          socket.roomID = unfilledRooms[0].roomID;
          io.sockets.in(socket.roomID).emit("toast", {
            message: "You are connected with a stranger!",
            user1: unfilledRooms[0].user1,
            user2: unfilledRooms[0].user2
          });
          socket.emit("init-call", { pId: unfilledRooms[0].peerId });
        } catch (e) {
          console.log("CREATED ROOM");
          // dont have unfilled rooms. Thus creating a new user.
          let uID = uniqueID();
          console.log("PEERID:", user.peerId);
          rooms.push({
            roomID: userData?.id,
            user1: userData,
            user2: null,
            isFilled: false,
            peerId: user.peerId
          });
          socket.join(userData?.id);
          socket.roomID = userData?.id;
          socket.emit("private ack", {
            message: "Added to privateRoom",
            roomID: userData?.id
          });
        }
      });
    }
    asyncCall();
  });
  socket.on("sendMessage", data => {
    let timeStamp = moment().format("LT");
    io.sockets.in(data.room).emit("newMessage", {
      message: data,
      senderId: data.senderId,
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
    console.log("User Disconnected");
    let index = onlineUsers.indexOf(socket);
    onlineUsers.splice(index, 1);
    index = rooms.findIndex(
      x =>
        x.user1?.id === windowID?.userData?.id ||
        x.user2?.id === windowID?.userData?.id
    );
    console.log("INDEX:", index);
    console.log("windowsID:", windowID?.userData?.id);
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

app.set("io", io);

exports.module = server;
module.exports.io = io;
