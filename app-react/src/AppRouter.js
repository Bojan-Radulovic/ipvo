import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import Admin from "./Admin";
import Store from "./Store";
import ItemDetail from "./ItemDetail";

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/store" element={<Store />} />
        <Route path="/item/:itemId" element={<ItemDetail />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
