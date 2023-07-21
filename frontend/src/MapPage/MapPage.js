import React from "react";
import GoogleMapReact from "google-map-react";
import "./MapPage.css";
import { useSelector } from "react-redux";
import Marker from "./Marker";
import { setCardChosenOptions } from "./mapSlice";
import UserInfoCard from "./UserInfoCard";
import Messager from "../Messenger/Messenger";
import VideoRooms from "../VideoRooms/VideoRooms";

const MapPage = () => {
  const myLocation = useSelector((state) => state.map.myLocation);
  const onlineUsers = useSelector((state) => state.map.onlineUsers);
  const cardChosenOptions = useSelector((state) => state.map.cardChosenOptions);
  const defaultMapProps = {
    center: {
      lat: myLocation.lat,
      lng: myLocation.lng,
    },
    zoom: 11,
  };
  return (
    <div className="map_page_container">
      <GoogleMapReact
        bootstrapURLKeys={{ key: "AIzaSyDKrpUTgrCjDMT_0bDGFo4DwGwhFOhajqc" }}
        defaultCenter={defaultMapProps.center}
        defaultZoom={defaultMapProps.zoom}
      >
        {onlineUsers.map((user) => (
          <Marker
            lat={user.coords.lat}
            lng={user.coords.lng}
            key={user.socketId}
            myself={user.myself}
            socketId={user.socketId}
            username={user.username}
            coords={user.coords}
          />
        ))}
      </GoogleMapReact>
      <Messager />
      {cardChosenOptions && (
        <UserInfoCard
          socketId={cardChosenOptions.socketId}
          username={cardChosenOptions.username}
          userLocation={cardChosenOptions.coords}
        />
      )}
      <VideoRooms />
    </div>
  );
};

export default MapPage;
