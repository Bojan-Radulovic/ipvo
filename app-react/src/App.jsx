import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from './pages/Home'
import SingleProduct from './pages/SingleProduct'
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import OrderComplete from './pages/OrderComplete';
import SearchResults from './pages/SearchResults';

function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/:pageNumber"
          element={<Home />}
        />
        <Route
          path='/item/:itemId'
          element={<SingleProduct />}
        />
        <Route
          path='/search/:query'
          element={<SearchResults />}
        />
        <Route
          path='/cart'
          element={<Cart />}
        />
        <Route
          path='/checkout'
          element={<Checkout />}
        />
        <Route
          path='/order-complete'
          element={<OrderComplete />}
        />
        <Route
          path='/admin'
          element={<Admin />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
