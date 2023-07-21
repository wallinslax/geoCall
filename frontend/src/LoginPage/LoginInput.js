import React from "react";

const LoginInput = (props) => {
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      props.pressEnter();
    }
  };
  const { username, setUsername } = props;
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };
  return (
    <input
      className="l_page_input"
      value={username}
      onChange={handleUsernameChange}
      onKeyDown={handleKeyDown}
    />
  );
};

export default LoginInput;
