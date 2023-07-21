import io from "socket.io-client";
import {
  onlineUserHandler,
  userDisconnectedHandler,
} from "../store/actions/usersActions";
import { chatMessageHandler } from "../store/actions/messengerActions";
import { videoRoomsListHandler } from "../store/actions/videoRoomActions";
import { call, disconnect } from "../VideoRooms/webRTCHandler";

export const apiServer = "localhost";
// export const apiServer = "react-hooks-update-42a98.wl.r.appspot.com";

let socket = null;

export const connectWithSocketIOServer = () => {
  socket = io(apiServer);
  // socket = io("https://react-hooks-update-42a98.wl.r.appspot.com/");

  socket.on("connect", () => {
    console.log("Connected to socket server");
  });

  socket.on("online-users", (usersData) => {
    console.log("online-users", usersData);
    onlineUserHandler(socket.id, usersData);
  });

  socket.on("chat-message", (messageData) => {
    chatMessageHandler(messageData);
  });

  socket.on("video-rooms", (videoRooms) => {
    console.log("video-room broadcast received", videoRooms);
    videoRoomsListHandler(videoRooms);
  });
  socket.on("video-room-init", (data) => call(data));

  socket.on("video-call-disconnect", () => disconnect());

  socket.on("user-disconnected", (disconnectedUserSocketId) => {
    userDisconnectedHandler(disconnectedUserSocketId);
  });
};

export const login = (data) => {
  socket.emit("user-login", data);
};

export const confirm = (data) => {
  console.log("emitting confirm");
  socket.emit("user-confirm", data);
};

export const registerPeerId = (data) => {
  socket.emit("register-peerId", data);
};

export const sendChatMessage = (data) => {
  socket.emit("chat-message", data);
};

export const createVideoRoomIO = (data) => {
  console.log("emitting");
  socket.emit("video-room-create", data);
};

export const joinVideoRoom = (data) => {
  console.log("emitting event to join a room");
  console.log(data);
  socket.emit("video-room-join", data);
};

export const leaveVideoRoom = (data) => {
  socket.emit("video-room-leave", data);
};
