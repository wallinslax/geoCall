import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setMyLocation } from "../MapPage/mapSlice";

import "./LoginPage.css";
import LoginInput from "./LoginInput";
import Logo from "./Logo";
import { getFakeLocation } from "./FAKE_LOCATION";
import {
  connectWithSocketIOServer,
  login,
} from "../socketConnection/socketConn";
import { connectWithPeerServer } from "../VideoRooms/webRTCHandler";
// import { run } from "./qa";

const isUsernameValid = (username) => {
  return username.length > 0 && username.length < 10 && !username.includes(" ");
};

const locationOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

const LoginPage = () => {
  // https://stackoverflow.com/questions/57058879/how-to-create-dynamic-routes-with-react-router-dom
  const { id, userType } = useParams();
  const [username, setUsername] = useState(id ? id : "");
  const [locationErrorOccured, setLocationErrorOccured] = useState(false);

  const myLocation = useSelector((state) => state.map.myLocation);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = () => {
    login({
      username: username,
      coords: {
        lng: myLocation.lng,
        lat: myLocation.lat,
      },
    });
    // navigate("/location");
    navigate("/map");
  };

  const onSuccess = (position) => {
    console.log(position);
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

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      onError,
      locationOptions
    );

    // onSuccess(getFakeLocation());
  }, []);

  useEffect(() => {
    if (myLocation) {
      connectWithSocketIOServer();
      connectWithPeerServer();
    }
  }, [myLocation]);

  return (
    <div className="l_page_main_container">
      <div className="l_page_box">
        <Logo />
        <LoginInput
          username={username}
          setUsername={setUsername}
          pressEnter={handleLogin}
        />
        <button
          type="submit"
          className="l_page_login_button"
          disabled={!isUsernameValid(username) || locationErrorOccured}
          onClick={handleLogin}
        >
          Login
        </button>
        {/* <button onClick={run}>LangChain try</button> */}
      </div>
    </div>
  );
};

//Question Answering over Docs
// https://js.langchain.com/docs/modules/agents/toolkits/vectorstore

export default LoginPage;
