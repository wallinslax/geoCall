import React from "react";
import chatIcon from "../resources/images/chat-icon.svg";
import { useDispatch } from "react-redux";
import { addChatbox } from "../Messenger/messengerSlice";

const ChatButton = ({ socketId, username }) => {
  const dispatch = useDispatch();

  const handleAddChatbox = () => {
    console.log("Adding chatbox with socketId: " + socketId);
    dispatch(addChatbox({ socketId, username }));
  };

  return (
    <img
      src={chatIcon}
      className="map_page_card_img"
      onClick={handleAddChatbox}
    ></img>
  );
};

export default ChatButton;
