import React from "react";
import { Link } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>React and flask</h1>
        
        <Link to="/admin">
          <button>Admin page</button>
        </Link>
        
        <Link to="/store">
          <button>Store</button>
        </Link>
      </header>
    </div>
  );
}

export default App;
