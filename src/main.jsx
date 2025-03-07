import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import store from "./store/index.js";
import { Provider } from "react-redux";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
);
