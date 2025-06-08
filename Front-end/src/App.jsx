import React from "react";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";
import Navbar from "./Components/Navbar";

const App = () => {
  return (
    <>
      <Toaster position="top-right" />
      <AppRoutes />
    </>
  );
};

export default App;