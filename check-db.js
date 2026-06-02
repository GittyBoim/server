const { PrismaClient } = require("@prisma/client");

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log("Checking database connection...");
    
    // Try to count users
    const userCount = await prisma.user.count();
    console.log("? Database connected! Users count:", userCount);
    
    // Try to count items
    const itemCount = await prisma.item.count();
    console.log("? Items count:", itemCount);
    
  } catch (error) {
    console.error("? Database error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
