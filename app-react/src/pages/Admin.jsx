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
  const [imagePreview, setImagePreview] = useState(null);


  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const testClassification = async () => {
    if(selectedFile != null || itemDescription != "")
    {
      try {
        var formData = new FormData();
        if(selectedFile != null)
          formData.append('image', selectedFile);
        formData.append('itemDescription', itemDescription);
  
        const uploadResult = await fetch('/app-classification/classify', {
          method: "POST",
          body: formData
        });
  
  
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
      var formData = new FormData();
      formData.append('file', selectedFile);
      const response = await fetch(`/app-flask/write?name=${itemName}&price=${itemPrice}&available=${itemAvailable}&category=${itemCategory}&description=${itemDescription}`,
        {
          method: "POST",
          body: formData
        }
      );
      const responseJson = await response.json();

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
    <div style={styles.container}>
      <h2>Admin Page</h2>
      
      <form style={styles.form}>
        <label style={styles.label}>
          Upload Image:
          <input type="file" onChange={handleFileUpload} style={styles.input} />
        </label>

        {imagePreview && (
          <div style={{ margin: "20px 0", textAlign: "center" }}>
            <img
              src={imagePreview}
              alt="Uploaded Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                border: "1px solid #ddd",
                borderRadius: "5px",
              }}
            />
          </div>
        )}

        <label style={styles.label}>
          Item Name:
          <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} style={styles.input} />
        </label>

        <label style={styles.label}>
          Item Description:
          <textarea value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} style={styles.textarea} />
        </label>

        <label style={styles.label}>
          Item Price:
          <input type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} style={styles.input} />
        </label>

        <label style={styles.label}>
          Item Availability:
          <input type="checkbox" checked={itemAvailable} onChange={(e) => setItemAvailable(e.target.checked)} style={styles.checkbox} />
        </label>

        <label style={styles.label}>
          Item Category:
          <input type="text" value={itemCategory} onClick={testClassification} onFocus={testClassification} onChange={(e) => setItemCategory(e.target.value)} style={styles.input} />
        </label>

        <button type="button" onClick={handleAddItem} style={styles.button}>
          Add Item
        </button>
      </form>

      {apiResponseAddItem && (
        <div style={styles.apiResponse}>
          <h3>API Response (Add Item):</h3>
          <p>{apiResponseAddItem}</p>
        </div>
      )}

      {/* Send Email Section */}
      <div style={styles.section}>
        <label style={styles.label}>
          To:
          <input type="text" value={sentTo} onChange={(e) => setSentTo(e.target.value)} style={styles.input} />
        </label>

        <label style={styles.label}>
          Subject:
          <input type="text" value={sentSubject} onChange={(e) => setSentSubject(e.target.value)} style={styles.input} />
        </label>

        <label style={styles.label}>
          Body:
          <textarea value={sentBody} onChange={(e) => setSentBody(e.target.value)} style={styles.textarea} />
        </label>

        <button type="button" onClick={handleSendEmail} style={styles.button}>
          Send Email
        </button>
      </div>

      {apiResponseSendEmail && (
        <div style={styles.apiResponse}>
          <h3>API Response (Send Email):</h3>
          <p>{apiResponseSendEmail}</p>
        </div>
      )}

      {/* Database Actions */}
      <div style={styles.section}>
        <button type="button" onClick={handlePopulateDatabase} style={styles.button}>
          Populate Database
        </button>
        <button type="button" onClick={handleExportDatabase} style={styles.button}>
          Export Database
        </button>
      </div>

      {apiResponsePopulate && (
        <div style={styles.apiResponse}>
          <h3>API Response (Populate Database):</h3>
          <p>{apiResponsePopulate}</p>
        </div>
      )}

      {apiResponseExport && (
        <div style={styles.apiResponse}>
          <h3>API Response (Export Database):</h3>
          <p>{apiResponseExport}</p>
        </div>
      )}

      {/* Recommendation Section */}
      <form style={styles.form}>
        <label style={styles.label}>
          Name:
          <textarea value={name} onChange={(e) => setName(e.target.value)} style={styles.textarea} />
        </label>

        <label style={styles.label}>
          Query:
          <textarea value={query} onChange={(e) => setQuery(e.target.value)} style={styles.textarea} />
        </label>

        <label style={styles.label}>
          Amount:
          <input type="number" value={queryAmount} onChange={(e) => setQueryAmount(e.target.value)} style={styles.input} />
        </label>

        <button type="button" onClick={handleGetRecommendations} style={styles.button}>
          Get Recommendations
        </button>
      </form>

      {apiResponseRecommender && (
        <div style={styles.apiResponse}>
          <h3>API Response (Recommender):</h3>
          <div style={styles.recommendations}>
            {apiResponseRecommender.map((item, index) => (
              <div key={index} style={styles.recommendationItem}>
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

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "'Roboto', sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "30px",
  },
  label: {
    fontWeight: "bold",
    fontSize: "16px",
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "16px",
  },
  textarea: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "16px",
    minHeight: "80px",
  },
  checkbox: {
    width: "20px",
    height: "20px",
  },
  button: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.3s ease",
  },
  buttonHover: {
    backgroundColor: "#45a049",
  },
  section: {
    marginTop: "20px",
  },
  apiResponse: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#f9f9f9",
    border: "1px solid #ddd",
    borderRadius: "5px",
  },
  recommendations: {
    marginTop: "10px",
  },
  recommendationItem: {
    border: '1px solid #ddd', 
    padding: '10px', 
    margin: '10px 0',
    borderRadius: '5px',
  }
};

export default Admin;
