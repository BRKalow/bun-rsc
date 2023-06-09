import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createFromFetch } from "react-server-dom-webpack/client.browser";
// import reportWebVitals from "./reportWebVitals";

const content = createFromFetch(fetch("/rsc?path=/"));

export function Bootstrap() {
  return <div>{React.use(content)}</div>;
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Bootstrap />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
