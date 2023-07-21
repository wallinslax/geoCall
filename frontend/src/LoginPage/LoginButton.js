import React from "react";

const LoginButton = (props) => {
  return (
    <button
      type="submit"
      className="l_page_login_button"
      disabled={props.disabled}
      onClick={props.click}
    >
      Login
    </button>
  );
};

export default LoginButton;
