import React from "react";
import { useSelector } from "react-redux";
import ActionButtons from "./ActionButtons";

const Label = ({ fontSize, text }) => {
  return (
    <p className="map_page_card_label" style={{ fontSize }}>
      {text}
    </p>
  );
};
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return roundToTwoDecimals(d);
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

const roundToTwoDecimals = (num) => {
  return +(Math.round(num + "e+2") + "e-2");
};

const UserInfoCard = ({ socketId, username, userLocation }) => {
  const myLocation = useSelector((state) => state.map.myLocation);
  return (
    <div className="map_page_card_container">
      <Label text={username} fontSize="16px" />
      <Label
        text={`${getDistanceFromLatLonInKm(
          myLocation.lat,
          myLocation.lng,
          userLocation.lat,
          userLocation.lng
        )}km`}
        fontSize="14px"
      />
      <ActionButtons socketId={socketId} username={username} />
    </div>
  );
};

export default UserInfoCard;
