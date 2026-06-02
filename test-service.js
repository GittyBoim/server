const itemsService = require("./src/services/items.service");

async function testService() {
  try {
    console.log("Testing items service directly...");
    const item = await itemsService.getItemBySerial("NONEXISTENT");
    console.log("Result:", item);
  } catch (error) {
    console.error("Service error:", error.message);
  }
}

testService();
