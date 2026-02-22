import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ConfigProvider } from 'antd-mobile'
import "antd-mobile/es/global";
import "./styles/theme-tokens.css";
import enUS from 'antd-mobile/es/locales/en-US'

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider locale={enUS}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
