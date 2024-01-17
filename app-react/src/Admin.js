import React, { useState } from "react";

function Admin() {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemAvailable, setItemAvailable] = useState(true);
  const [itemCategory, setItemCategory] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [apiResponseAddItem, setApiResponseAddItem] = useState("");
  const [apiResponsePopulate, setApiResponsePopulate] = useState("");

  const handleAddItem = async () => {
    try {
      const response = await fetch(`/app-flask/write?name=${itemName}&price=${itemPrice}&available=${itemAvailable}&category=${itemCategory}&description=${itemDescription}`);
      const data = await response.text();
      setApiResponseAddItem(data);
    } catch (error) {
      console.error("Error adding item:", error);
      setApiResponseAddItem("Error adding item. Please check the console for details.");
    }
  };

  const handlePopulateDatabase = async () => {
    try {
      const response = await fetch("/app-flask/populate");
      const data = await response.text();
      setApiResponsePopulate(data);
    } catch (error) {
      console.error("Error populating database:", error);
      setApiResponsePopulate("Error populating database. Please check the console for details.");
    }
  };

  return (
    <div>
      <h2>Admin Page</h2>
      
      <form>
        <label>
          Item Name:
          <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} />
        </label>
        <br />
        <label>
          Item Price:
          <input type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
        </label>
        <br />
        <label>
          Item Availability:
          <input type="checkbox" checked={itemAvailable} onChange={(e) => setItemAvailable(e.target.checked)} />
        </label>
        <br />
        <label>
          Item Category:
          <input type="text" value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} />
        </label>
        <br />
        <label>
          Item Description:
          <textarea value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} />
        </label>
        <br />
        <button type="button" onClick={handleAddItem}>
          Add Item
        </button>
      </form>

      {apiResponseAddItem && (
        <div>
          <h3>API Response (Add Item):</h3>
          <p>{apiResponseAddItem}</p>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <button type="button" onClick={handlePopulateDatabase}>
          Populate Database
        </button>
      </div>

      {apiResponsePopulate && (
        <div style={{ marginTop: "20px" }}>
          <h3>API Response (Populate Database):</h3>
          <p>{apiResponsePopulate}</p>
        </div>
      )}
    </div>
  );
}

export default Admin;
