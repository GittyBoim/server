const axios = require("axios");

async function testRoot() {
  try {
    console.log("Testing root endpoint...");
    const response = await axios.get("http://localhost:3000/");
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

testRoot();
