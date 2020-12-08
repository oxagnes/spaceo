import { createStore } from "redux";

const initialState = {
  sidebarShow: "responsive",
  isDesktop: true,
  asideShow: false,
  darkMode: false,
  progress: 0,
};

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case "set":
      return { ...state, ...rest };
    default:
      return state;
  }
};

const store = createStore(changeState);
export default store;
