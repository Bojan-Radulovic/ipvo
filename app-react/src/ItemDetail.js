import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function ItemDetail() {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const fetchItemDetail = async () => {
      try {
        const response = await fetch(`/app-flask/item/${itemId}`);
        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error("Error fetching item details:", error);
      }
    };

    fetchItemDetail();
  }, [itemId]);

  return (
    <div>
      <h2>Item Detail Page</h2>

      {item ? (
        <div>
          <h3>{item.name}</h3>
          <p>Price: ${item.price}</p>
          <p>Available: {item.available ? "Yes" : "No"}</p>
          <p>Category: {item.category}</p>
          <p>Description: {item.description}</p>
        </div>
      ) : (
        <p>Loading item details...</p>
      )}
    </div>
  );
}

export default ItemDetail;
