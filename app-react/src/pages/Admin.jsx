import React, { useState } from "react";

function Admin() {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemAvailable, setItemAvailable] = useState(true);
  const [itemCategory, setItemCategory] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [sentTo, setSentTo] = useState("bokiflet@gmail.com");
  const [sentSubject, setSentSubject] = useState("Order #1234 - Receipt and Confirmation");
  const [sentBody, setSentBody] = useState("Thank you for your business!\n\nYour order:\n\nOrder ID: 1234\n\nShoes: $59.99\nJacket: $99.99\n\nTotal: $159.98\n\n\nShipping Details...");
  const [apiResponseAddItem, setApiResponseAddItem] = useState("");
  const [apiResponsePopulate, setApiResponsePopulate] = useState("");
  const [apiResponseExport, setApiResponseExport] = useState("");
  const [apiResponseSendEmail, setApiResponseSendEmail] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [queryAmount, setQueryAmount] = useState("");
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [apiResponseRecommender, setApiResponseRecommender] = useState("");

  const handleFileUpload = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const testClassification = async () => {
    if(selectedFile != null && itemDescription != "")
    {
      try {
        var formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('itemDescription', itemDescription);
  
        const uploadResult = await fetch('/app-classification/classify', {
          method: "POST",
          body: formData
        });
  
  
        //const response = await fetch(`/app-classification/test`);
        //const responseJson = await response.json();
  
        const result = await uploadResult.json();
        setItemCategory(result.predicted_class);

        console.log("Upload result:", result);
      } catch (error) {
        console.error("Error uploading the image:", error);
      }
    }
  };

  const handleAddItem = async () => {
    try {
      const response = await fetch(`/app-flask/write?name=${itemName}&price=${itemPrice}&available=${itemAvailable}&category=${itemCategory}&description=${itemDescription}`);
      const responseJson = await response.json();
      //const data = await response.text();

      const uploadResponse = await fetch(`/app-flask/getminiourl?filename=${responseJson._id}`);
      const uploadJson = await uploadResponse.json();
      var formData = new FormData();
      for(var key in uploadJson.fields)
      {
        formData.append(key, uploadJson.fields[key]);
      }
      formData.append('file', selectedFile);
      const uploadResult = await fetch('http://localhost:9000/photos', {
        method: "POST",
        body: formData
      });

      setApiResponseAddItem(responseJson.message);
    } catch (error) {
      console.error("Error adding item:", error);
      setApiResponseAddItem("Error adding item. Please check the console for details.");
    }
  };

  const handleGetRecommendations = async () => {
    try {
      const response = await fetch(`/app-flask/recommender?query=${query}&amount=${queryAmount}&name=${name}`);
      const responseJson = await response.json();

      console.log("Recived recommendations:", responseJson.items);
      setApiResponseRecommender(responseJson.items);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      setApiResponseRecommender("Error getting recommendations:", error);
    }
  };

  const handlePopulateDatabase = async () => {
    try {
      const response = await fetch("/app-flask/populate_new");
      const data = await response.text();
      setApiResponsePopulate(data);
    } catch (error) {
      console.error("Error populating database:", error);
      setApiResponsePopulate("Error populating database:", error);
    }
  };

  const handleExportDatabase = async () => {
    try {
      const response = await fetch("/app-flask/export");
      const data = await response.text();
      setApiResponseExport(data);
    } catch (error) {
      console.error("Error exporting database:", error);
      setApiResponseExport("Error exporting database:", error);
    }
  };

  const handleSendEmail = async () => {
    try {
      const response = await fetch("/app-flask/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: sentTo,
          subject: sentSubject,
          body: sentBody,
        }),
      });
      const data = await response.text();
      setApiResponseSendEmail(data);
    } catch (error) {
      console.error("Error sending email:", error);
      setApiResponseSendEmail("Error sending email. Please check the console for details.");
    }
  };
  

  return (
    <div>
      <h2>Admin Page</h2>
      
      <form>
        <label>
          Upload Image:
          <input type="file" onChange={handleFileUpload} />
        </label>
        <br />
        <label>
          Item Name:
          <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} />
        </label>
        <br />
        <label>
          Item Description:
          <textarea value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} />
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
          <input type="text" value={itemCategory} onClick={testClassification} onChange={(e) => setItemCategory(e.target.value)} />
        </label>
        <br />
        <button type="button" onClick={handleAddItem}>
          Add Item
        </button>
        <br />
      </form>

      {apiResponseAddItem && (
        <div>
          <h3>API Response (Add Item):</h3>
          <p>{apiResponseAddItem}</p>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <label>
          To:
          <input type="text" value={sentTo} onChange={(e) => setSentTo(e.target.value)} />
        </label>
        <br />
        <label>
          Subject:
          <input type="text" value={sentSubject} onChange={(e) => setSentSubject(e.target.value)} />
        </label>
        <br />
        <label>
          Body:
          <textarea value={sentBody} onChange={(e) => setSentBody(e.target.value)} />
        </label>
        <br />
        <button type="button" onClick={handleSendEmail}>
          Send Email
        </button>
      </div>

      {apiResponseSendEmail && (
        <div style={{ marginTop: "20px" }}>
          <h3>API Response (Send Email):</h3>
          <p>{apiResponseSendEmail}</p>
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

      <div style={{ marginTop: "20px" }}>
        <button type="button" onClick={handleExportDatabase}>
          Export Database
        </button>
      </div>

      {apiResponseExport && (
        <div style={{ marginTop: "20px" }}>
          <h3>API Response (Export Database):</h3>
          <p>{apiResponseExport}</p>
        </div>
      )}
      <form>
        <label>
          Name:
          <textarea value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Query:
          <textarea value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <br />
        <label>
          Amount:
          <input type="number" value={queryAmount} onChange={(e) => setQueryAmount(e.target.value)} />
        </label>
        <br />
        <button type="button" onClick={handleGetRecommendations}>
          Get recommendations
        </button>
        <br />
      </form>

      {apiResponseRecommender && (
        <div style={{ marginTop: "20px" }}>
          <h3>API Response (Recommender):</h3>
          <div style={{ marginTop: "10px" }}>
            {apiResponseRecommender.map((item, index) => (
              <div key={index} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0' }}>
                  {Object.keys(item).map((key) => (
                      <p key={key}><strong>{key}:</strong> {item[key]}</p>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default Admin;
