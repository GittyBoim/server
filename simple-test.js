const axios = require("axios");

async function simpleTest() {
  try {
    console.log("Testing simple endpoint...");
    const response = await axios.get("http://localhost:3000/items/NONEXISTENT");
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

simpleTest();
