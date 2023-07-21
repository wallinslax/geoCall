import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
import * as socketConn from "../socketConnection/socketConn";
import { connectWithPeerServer } from "../VideoRooms/webRTCHandler";
import { useDispatch, useSelector } from "react-redux";
import { setMyLocation } from "../MapPage/mapSlice";

import {
  getAccessToLocalStream,
  getPeerId,
  disconnect,
} from "../VideoRooms/webRTCHandler";
import Video from "../VideoRooms/Video";

// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  // apiKey: "AIzaSyC6lcZkGnMHPPARrddPvGTU5DjsWHa9tJc",
  databaseURL: "https://react-hooks-update-42a98-default-rtdb.firebaseio.com/",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const ConfirmPage = () => {
  // http://localhost:3000/transaction_001/tenant
  const { transactionId, userType } = useParams();
  const [tenantId, setTenantId] = useState("undefined tenantId");
  const [landlordId, setLandlordId] = useState("undefined landlordId");
  const [roomId, setRoomId] = useState("undefined roomId");
  const userIdRef = ref(database, "booking/" + transactionId);
  // set(userIdRef, {
  //   tenantId: "tenant_001",
  //   landlordId: "landlord_001",
  //   roomId: "room_001",
  //   startTime: "2021-10-01 10:00:00",
  //   endTime: "2021-10-01 12:00:00",
  // });
  const myLocation = useSelector((state) => state.map.myLocation);
  const [locationErrorOccured, setLocationErrorOccured] = useState(false);
  const dispatch = useDispatch();

  const navigate = useNavigate();
  // initialize socket.io server/peer server
  useEffect(() => {
    if (myLocation) {
      socketConn.connectWithSocketIOServer();
      connectWithPeerServer();
    }
  }, [myLocation]);

  // location
  const locationOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      onError,
      locationOptions
    );

    onValue(userIdRef, (snapshot) => {
      setTenantId(snapshot.val().tenantId);
      setLandlordId(snapshot.val().landlordId);
      setRoomId(snapshot.val().roomId);
    });
  }, []);

  const onSuccess = (position) => {
    console.log("onSuccess", position);
    dispatch(
      setMyLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })
    );
  };

  const onError = (error) => {
    console.log("Error occur:", error);
    setLocationErrorOccured(true);
  };
  // firebase
  useEffect(() => {
    onValue(userIdRef, (snapshot) => {
      setTenantId(snapshot.val().tenantId);
      setLandlordId(snapshot.val().landlordId);
      setRoomId(snapshot.val().roomId);
    });
  }, []);

  const handleConfirm = () => {
    console.log("click confirm");
    socketConn.confirm({
      transactionId: transactionId,
      userType: userType,
      coords: {
        lng: myLocation.lng,
        lat: myLocation.lat,
      },
    });
    handleLocalStrem();
    // navigate("/map");
  };
  const handleLocalStrem = async () => {
    // get access to local stream from videoRoomActions.js createVideoRoom()
    const success = await getAccessToLocalStream();
    if (success) {
      console.log("getAccessToLocalStream success");
      socketConn.registerPeerId({
        userType: userType,
        transactionId: transactionId,
        peerId: getPeerId(),
      });
    }
  };
  const localStream = useSelector((state) => state.videoRooms.localStream);
  const remoteStream = useSelector((state) => state.videoRooms.remoteStream);

  return (
    <div>
      <h1>ConfirmPage </h1>
      <h2>tenantId={tenantId}</h2>
      <h2>landlordId={landlordId}</h2>
      <h2>roomId={roomId}</h2>
      <h2>transactionId={transactionId}</h2>
      <h2>userType={userType}</h2>
      <h2>lng:{myLocation && myLocation.lng}</h2>
      <h2>lat:{myLocation && myLocation.lat}</h2>
      <button type="submit" disabled={false} onClick={handleConfirm}>
        Login
      </button>
      {localStream && <Video stream={localStream} muted />}
      {remoteStream && <Video stream={remoteStream} muted />}
    </div>
  );
};
export default ConfirmPage;
