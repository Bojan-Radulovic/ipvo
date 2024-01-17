import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Store() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/app-flask/items");
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  return (
    <div>
      <h2>Store Page</h2>
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item.name}>
              <Link to={`/item/${item._id}`}>
                <strong>{item.name}</strong> - ${item.price}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No items available in the store.</p>
      )}
    </div>
  );
}

export default Store;
