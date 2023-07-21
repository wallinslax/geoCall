import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  myLocation: null,
  onlineUsers: [],
  cardChosenOptions: null,
};

export const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setMyLocation: (state, action) => {
      state.myLocation = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    removeDisconnectedUser: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter(
        (user) => user.socketId !== action.payload
      );
    },
    setCardChosenOptions: (state, action) => {
      state.cardChosenOptions = action.payload;
    },
  },
});

export const {
  setMyLocation,
  setOnlineUsers,
  removeDisconnectedUser,
  setCardChosenOptions,
} = mapSlice.actions;

export default mapSlice.reducer;
