const axios = require("axios");

async function testDirectDB() {
  try {
    console.log("Testing direct database access...");
    const response = await axios.get("http://localhost:3000/test-db");
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

testDirectDB();
