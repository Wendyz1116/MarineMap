import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css";
// import App from "./App";

// // Remove StrictMode temporarily
ReactDOM.createRoot(document.getElementById("root")).render(<App />);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  // React StrictMode cause double rendering, trigger things
  // twice to find side efx. Just does this during dev tho,
  // not during prod build
  
  // <React.StrictMode>
  <RouterProvider router={router} />
  // </React.StrictMode>
  
);
