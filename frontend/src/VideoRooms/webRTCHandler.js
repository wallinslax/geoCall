import { setLocalStream, setRemoteStream } from "./videoRoomsSlice";
import store from "../store/store";
import { Peer } from "peerjs";
import { apiServer } from "../socketConnection/socketConn";

let peer;
let peerId;

export const getPeerId = () => {
  return peerId;
};

export const getAccessToLocalStream = async () => {
  const localStream = await navigator.mediaDevices.getUserMedia({
    // if you not have camera - just set video to false
    video: true,
    audio: true,
  });

  if (localStream) store.dispatch(setLocalStream(localStream));

  return Boolean(localStream);
};

export const connectWithPeerServer = () => {
  // peer = new Peer(undefined, {
  //   host: "0.peerjs.com",
  //   // host: apiServer,
  //   port: 9000,
  //   path: "/peer",
  // });
  peer = new Peer();

  peer.on("open", (id) => {
    console.log("My peer ID is:" + id);
    peerId = id;
  });

  peer.on("call", async (call) => {
    const localStream = store.getState().videoRooms.localStream;

    call.answer(localStream); // Answer the call with A/V stream

    call.on("stream", (remoteStream) => {
      console.log("remote stream came");
      store.dispatch(setRemoteStream(remoteStream));
    });
  });
};

export const call = (data) => {
  const { newParticipantPeerId } = data;

  const localStream = store.getState().videoRooms.localStream;

  const peerCall = peer.call(newParticipantPeerId, localStream);

  peerCall.on("stream", (remoteStream) => {
    console.log("remote stream came");
    store.dispatch(setRemoteStream(remoteStream));
  });
};

export const disconnect = () => {
  // close all peer connections

  for (let conns in peer.connections) {
    peer.connections[conns].forEach((c) => {
      console.log("closing connections");
      c.peerConnection.close();

      if (c.close) c.close();
    });
  }

  store.dispatch(setRemoteStream(null));
};
