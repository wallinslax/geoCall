const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { PeerServer } = require("peer");
const path = require("path");
const app = express();
app.use(cors());
app.enable("trust proxy");

const rootPath = path.join(__dirname, "build");

// root
//app.use("/", express.static("frontend2/dist/test-modal"));
app.use("/", express.static(rootPath));
app.get("/", (req, res, next) => {
  console.log("__dirname=" + __dirname);
  res.sendFile("index.html", { rootPath });
  //res.status(200).send("Hello, world!").end();
  //res.send("Hello World");
});

const server = http.createServer(app);

const PORT = process.env.PORT || 80;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});
// peer server
// const peerServer = PeerServer({ port: 9000, path: "/peer" });

// Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let onlineUsers = {};
let onlineTransactions = {};
let videoRooms = {};

io.on("connection", (socket) => {
  console.log("a user connected socket id: ", socket.id);

  socket.on("user-login", (data) => loginEventHandler(socket, data));

  socket.on("user-confirm", (data) => {
    const { userType, transactionId } = data;
    if (userType === "tenant")
      onlineTransactions[transactionId] = {
        ...onlineTransactions[transactionId],
        isTenantOnline: true,
        tenantSocketId: socket.id,
      };
    else if (userType === "landlord")
      onlineTransactions[transactionId] = {
        ...onlineTransactions[transactionId],
        isLandlordOnline: true,
        landlordSocketId: socket.id,
      };
    else console.log("user type not found");

    const object1 = {
      prop: "exists",
    };

    console.log(Object.hasOwn(object1, "prop"));

    if (
      Object.hasOwn(onlineTransactions[transactionId], "isTenantOnline") &&
      Object.hasOwn(onlineTransactions[transactionId], "isLandlordOnline")
    ) {
      console.log("both are online");
    }

    console.log(
      "server: user-confirm: onlineTransactions[transactionId]",
      onlineTransactions[transactionId]
    );
  });

  socket.on("register-peerId", (data) => {
    const { userType, transactionId } = data;
    if (userType === "tenant")
      onlineTransactions[transactionId] = {
        ...onlineTransactions[transactionId],
        tenantPeerId: data.peerId,
      };
    else if (userType === "landlord")
      onlineTransactions[transactionId] = {
        ...onlineTransactions[transactionId],
        landlordPeerId: data.peerId,
      };
    else console.log("user type not found");

    console.log(
      "server: register-peerId: onlineTransactions[transactionId]",
      onlineTransactions[transactionId]
    );

    if (
      Object.hasOwn(onlineTransactions[transactionId], "tenantPeerId") &&
      Object.hasOwn(onlineTransactions[transactionId], "landlordPeerId")
    ) {
      // Tell tenant to call landlord
      console.log("Tell tenant to call landlord");
      socket
        .to(onlineTransactions[transactionId].tenantSocketId)
        .emit("video-room-init", {
          newParticipantPeerId:
            onlineTransactions[transactionId].landlordPeerId,
        });
    }
  });

  socket.on("disconnect", () => disconnectEventHandler(socket));
  socket.on("chat-message", (data) => chatMessageHandler(socket, data));
  socket.on("video-room-create", (data) =>
    videoRoomCreateHandler(socket, data)
  );
  socket.on("video-room-leave", (data) => videoRoomLeaveHandler(socket, data));
  socket.on("video-room-join", (data) => videoRoomJoinHandler(socket, data));
});

// Socket event handler
const videoRoomLeaveHandler = (socket, data) => {
  const { roomId } = data;

  if (videoRooms[roomId]) {
    videoRooms[roomId].participants = videoRooms[roomId].participants.filter(
      (p) => p.socketId !== socket.id
    );
  }

  if (videoRooms[roomId].participants.length > 0) {
    // emit an event to the user which is in the room that he should also close his peer conection
    socket
      .to(videoRooms[roomId].participants[0].socketId)
      .emit("video-call-disconnect");
  }

  if (videoRooms[roomId].participants.length < 1) {
    delete videoRooms[roomId];
  }

  broadcastVideoRooms();
};

const videoRoomJoinHandler = (socket, data) => {
  const { roomId, peerId } = data;

  if (videoRooms[roomId]) {
    videoRooms[roomId].participants.forEach((participant) => {
      socket.to(participant.socketId).emit("video-room-init", {
        newParticipantPeerId: peerId,
      });
    });

    videoRooms[roomId].participants = [
      ...videoRooms[roomId].participants,
      {
        socketId: socket.id,
        username: onlineUsers[socket.id].username,
        peerId,
      },
    ];

    broadcastVideoRooms();
  }
};

const videoRoomCreateHandler = (socket, data) => {
  const { peerId, newRoomId } = data;

  // add new room
  videoRooms[newRoomId] = {
    participants: [
      {
        socketId: socket.id,
        username: onlineUsers[socket.id].username,
        peerId: peerId,
      },
    ],
  };
  broadcastVideoRooms();
  console.log("new room", data);
};

const loginEventHandler = (socket, data) => {
  socket.join("logged-users");
  onlineUsers[socket.id] = {
    username: data.username,
    coords: data.coords,
  };
  console.log("onlineUsers: ", onlineUsers);

  io.to("logged-users").emit("online-users", convertOnlineUsersToArray());
  broadcastVideoRooms();
};

const convertOnlineUsersToArray = () => {
  const onlineUsersArray = [];

  Object.entries(onlineUsers).forEach(([socketId, user]) => {
    onlineUsersArray.push({
      socketId: socketId,
      username: user.username,
      coords: user.coords,
    });
  });
  return onlineUsersArray;
};

const chatMessageHandler = (socket, data) => {
  const { receiverSocketId, content, id } = data;
  if (onlineUsers[receiverSocketId]) {
    console.log("message sent to: ", receiverSocketId);

    io.to(receiverSocketId).emit("chat-message", {
      senderSocketId: socket.id,
      content: content,
      id: id,
    });
  }
};

const disconnectEventHandler = (socket) => {
  console.log(`user disconnected of the id: ${socket.id}`);
  checkIfUserIsInCall(socket);
  removeOnlineUser(socket.id);
  broadcastDisconnectedUserDetails(socket.id);
};

const checkIfUserIsInCall = (socket) => {
  Object.entries(videoRooms).forEach(([key, value]) => {
    const participant = value.participants.find(
      (p) => p.socketId === socket.id
    );

    if (participant) {
      removeUserFromTheVideoRoom(socket.id, key);
    }
  });
};

const removeUserFromTheVideoRoom = (socketId, roomId) => {
  videoRooms[roomId].participants = videoRooms[roomId].participants.filter(
    (p) => p.socketId !== socketId
  );

  // remove room if no participants left in the room
  if (videoRooms[roomId].participants.length < 1) {
    delete videoRooms[roomId];
  } else {
    // if still there is a user in the room - inform him to clear his peer connection

    io.to(videoRooms[roomId].participants[0].socketId).emit(
      "video-call-disconnect"
    );
  }

  broadcastVideoRooms();
};

const removeOnlineUser = (socketId) => {
  if (onlineUsers[socketId] === undefined) return;
  delete onlineUsers[socketId];
  console.log("onlineUsers: ", onlineUsers);
};

const broadcastDisconnectedUserDetails = (socketId) => {
  io.to("logged-users").emit("user-disconnected", socketId);
};

const broadcastVideoRooms = () => {
  io.to("logged-users").emit("video-rooms", videoRooms);
};
