import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  await prisma.auditLog.deleteMany()
  await prisma.inventoryTransaction.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.order.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.menuCategory.deleteMany()
  await prisma.ingredient.deleteMany()
  await prisma.table.deleteMany()
  await prisma.user.deleteMany()
  await prisma.restaurant.deleteMany()

  const restaurant = await prisma.restaurant.create({
    data: {
      id: "default",
      name: "Tandoori Flame Restaurant",
      gstin: "07AAPCT1234F1Z5",
      address: "42, MG Road, Connaught Place, New Delhi - 110001",
      phone: "+91 11 2345 6789",
      email: "info@tandooriflame.in",
      currency: "INR",
      timezone: "Asia/Kolkata",
      serviceCharge: 10,
      serviceChargeType: "percentage",
      tableCount: 20,
    },
  })
  console.log(`Created restaurant: ${restaurant.name}`)

  const hashedPassword = await bcrypt.hash("password123", 12)

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Aman Ali",
        email: "aman@tandooriflame.in",
        phone: "+91 98765 43210",
        password: hashedPassword,
        role: "owner",
        restaurantId: restaurant.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Rajesh Kumar",
        email: "rajesh@tandooriflame.in",
        phone: "+91 98765 43211",
        password: hashedPassword,
        role: "manager",
        restaurantId: restaurant.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Vikram Singh",
        email: "vikram@tandooriflame.in",
        phone: "+91 98765 43212",
        password: hashedPassword,
        role: "waiter",
        restaurantId: restaurant.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Suresh Patel",
        email: "suresh@tandooriflame.in",
        phone: "+91 98765 43213",
        password: hashedPassword,
        role: "waiter",
        restaurantId: restaurant.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Mohan Lal",
        email: "mohan@tandooriflame.in",
        phone: "+91 98765 43214",
        password: hashedPassword,
        role: "chef",
        restaurantId: restaurant.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Arun Joshi",
        email: "arun@tandooriflame.in",
        phone: "+91 98765 43215",
        password: hashedPassword,
        role: "chef",
        restaurantId: restaurant.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Priya Sharma",
        email: "priya@tandooriflame.in",
        phone: "+91 98765 43216",
        password: hashedPassword,
        role: "cashier",
        restaurantId: restaurant.id,
      },
    }),
  ])
  console.log(`Created ${users.length} users`)

  const categories = await Promise.all([
    prisma.menuCategory.create({
      data: { name: "Starters", description: "Appetizers and small plates", sortOrder: 1, restaurantId: restaurant.id },
    }),
    prisma.menuCategory.create({
      data: { name: "Main Course", description: "Signature curries and gravies", sortOrder: 2, restaurantId: restaurant.id },
    }),
    prisma.menuCategory.create({
      data: { name: "Breads", description: "Tandoori breads", sortOrder: 3, restaurantId: restaurant.id },
    }),
    prisma.menuCategory.create({
      data: { name: "Rice & Biryani", description: "Rice specialties", sortOrder: 4, restaurantId: restaurant.id },
    }),
    prisma.menuCategory.create({
      data: { name: "Desserts", description: "Sweet endings", sortOrder: 5, restaurantId: restaurant.id },
    }),
    prisma.menuCategory.create({
      data: { name: "Beverages", description: "Drinks and refreshments", sortOrder: 6, restaurantId: restaurant.id },
    }),
  ])
  console.log(`Created ${categories.length} categories`)

  const categoriesMap: Record<string, string> = {}
  for (const cat of categories) {
    categoriesMap[cat.name] = cat.id
  }

  const menuItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Starters"],
        name: "Paneer Tikka",
        description: "Cottage cheese marinated in spices, grilled in tandoor",
        price: 320,
        variants: [{ name: "Half", price: 180 }, { name: "Full", price: 320 }],
        gstRate: 5,
        hsnCode: "21069099",
        prepTimeMinutes: 15,
        isDailySpecial: false,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Starters"],
        name: "Chicken Tikka",
        description: "Boneless chicken marinated in yogurt and spices",
        price: 380,
        variants: [{ name: "Half", price: 210 }, { name: "Full", price: 380 }],
        gstRate: 5,
        hsnCode: "16041990",
        prepTimeMinutes: 15,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Starters"],
        name: "Spring Rolls",
        description: "Crispy vegetable spring rolls with sweet chili sauce",
        price: 250,
        gstRate: 5,
        hsnCode: "19059040",
        prepTimeMinutes: 10,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Starters"],
        name: "Manchow Soup",
        description: "Hot and sour vegetable soup with noodles",
        price: 180,
        gstRate: 5,
        hsnCode: "21041090",
        prepTimeMinutes: 8,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Starters"],
        name: "Samosa (2 pcs)",
        description: "Crispy pastry filled with spiced potatoes and peas",
        price: 120,
        gstRate: 5,
        hsnCode: "19059040",
        prepTimeMinutes: 10,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Main Course"],
        name: "Butter Chicken",
        description: "Creamy tomato-based curry with tender chicken pieces",
        price: 420,
        variants: [{ name: "Half", price: 250 }, { name: "Full", price: 420 }],
        gstRate: 12,
        hsnCode: "16041990",
        prepTimeMinutes: 20,
        isDailySpecial: true,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Main Course"],
        name: "Dal Makhani",
        description: "Slow-cooked black lentils in creamy tomato gravy",
        price: 350,
        variants: [{ name: "Half", price: 200 }, { name: "Full", price: 350 }],
        gstRate: 5,
        hsnCode: "07134000",
        prepTimeMinutes: 15,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Main Course"],
        name: "Palak Paneer",
        description: "Cottage cheese in creamy spinach gravy",
        price: 340,
        gstRate: 5,
        hsnCode: "21069099",
        prepTimeMinutes: 15,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Main Course"],
        name: "Chicken Curry",
        description: "Traditional North Indian chicken curry",
        price: 380,
        variants: [{ name: "Half", price: 220 }, { name: "Full", price: 380 }],
        gstRate: 12,
        hsnCode: "16041990",
        prepTimeMinutes: 20,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Main Course"],
        name: "Fish Curry",
        description: "Goan-style coconut fish curry",
        price: 450,
        gstRate: 12,
        hsnCode: "16041990",
        prepTimeMinutes: 20,
        isDailySpecial: true,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Breads"],
        name: "Tandoori Roti",
        description: "Whole wheat bread baked in tandoor",
        price: 35,
        gstRate: 5,
        hsnCode: "19059040",
        prepTimeMinutes: 5,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Breads"],
        name: "Naan",
        description: "Leavened bread baked in tandoor",
        price: 45,
        variants: [{ name: "Plain", price: 45 }, { name: "Butter", price: 55 }, { name: "Garlic", price: 65 }],
        gstRate: 5,
        hsnCode: "19059040",
        prepTimeMinutes: 5,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Breads"],
        name: "Laccha Paratha",
        description: "Layered whole wheat paratha",
        price: 55,
        gstRate: 5,
        hsnCode: "19059040",
        prepTimeMinutes: 8,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Rice & Biryani"],
        name: "Steamed Rice",
        description: "Plain basmati rice",
        price: 120,
        gstRate: 5,
        hsnCode: "10063090",
        prepTimeMinutes: 10,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Rice & Biryani"],
        name: "Chicken Biryani",
        description: "Fragrant basmati rice layered with spiced chicken",
        price: 380,
        variants: [{ name: "Single", price: 380 }, { name: "Full", price: 680 }],
        gstRate: 12,
        hsnCode: "16041990",
        prepTimeMinutes: 25,
        isDailySpecial: true,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Rice & Biryani"],
        name: "Veg Biryani",
        description: "Fragrant basmati rice with mixed vegetables",
        price: 320,
        variants: [{ name: "Single", price: 320 }, { name: "Full", price: 580 }],
        gstRate: 5,
        hsnCode: "21069099",
        prepTimeMinutes: 20,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Desserts"],
        name: "Gulab Jamun (2 pcs)",
        description: "Deep-fried milk solid dumplings in sugar syrup",
        price: 120,
        gstRate: 5,
        hsnCode: "17049090",
        prepTimeMinutes: 2,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Desserts"],
        name: "Ice Cream",
        description: "Premium vanilla ice cream",
        price: 90,
        variants: [{ name: "Vanilla", price: 90 }, { name: "Chocolate", price: 100 }, { name: "Mango", price: 110 }],
        gstRate: 5,
        hsnCode: "21050000",
        prepTimeMinutes: 2,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Desserts"],
        name: "Kheer",
        description: "Traditional rice pudding with cardamom and nuts",
        price: 150,
        gstRate: 5,
        hsnCode: "19011090",
        prepTimeMinutes: 2,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Beverages"],
        name: "Masala Chai",
        description: "Spiced Indian tea",
        price: 60,
        gstRate: 5,
        hsnCode: "09024090",
        prepTimeMinutes: 3,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Beverages"],
        name: "Soft Drink",
        description: "Chilled carbonated beverage",
        price: 80,
        variants: [{ name: "Coke", price: 80 }, { name: "Sprite", price: 80 }, { name: "Pepsi", price: 80 }],
        gstRate: 12,
        hsnCode: "22021090",
        prepTimeMinutes: 1,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Beverages"],
        name: "Fresh Lime Water",
        description: "Freshly squeezed lime with salt or sugar",
        price: 50,
        gstRate: 5,
        hsnCode: "22029090",
        prepTimeMinutes: 2,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: categoriesMap["Beverages"],
        name: "Lassi",
        description: "Traditional yogurt drink",
        price: 120,
        variants: [{ name: "Sweet", price: 120 }, { name: "Salted", price: 120 }, { name: "Mango", price: 150 }],
        gstRate: 5,
        hsnCode: "04039090",
        prepTimeMinutes: 3,
        restaurantId: restaurant.id,
      },
    }),
  ])
  console.log(`Created ${menuItems.length} menu items`)

  const tables = []
  for (let i = 1; i <= 20; i++) {
    const name = i <= 10 ? `Table ${i}` : `Table ${i}`
    const capacity = i <= 10 ? 4 : i <= 15 ? 2 : 6
    tables.push(
      prisma.table.create({
        data: {
          number: i,
          name,
          capacity,
          status: "available",
          restaurantId: restaurant.id,
        },
      })
    )
  }
  await Promise.all(tables)
  console.log(`Created ${tables.length} tables`)

  const ingredients = await Promise.all([
    prisma.ingredient.create({ data: { name: "Chicken Breast", unit: "kg", currentStock: 15, minStockLevel: 5, maxStockLevel: 30, unitPrice: 280, restaurantId: restaurant.id } }),
    prisma.ingredient.create({ data: { name: "Basmati Rice", unit: "kg", currentStock: 25, minStockLevel: 10, maxStockLevel: 50, unitPrice: 120, restaurantId: restaurant.id } }),
    prisma.ingredient.create({ data: { name: "Paneer", unit: "kg", currentStock: 8, minStockLevel: 3, maxStockLevel: 15, unitPrice: 360, restaurantId: restaurant.id } }),
    prisma.ingredient.create({ data: { name: "Fresh Cream", unit: "litre", currentStock: 5, minStockLevel: 2, maxStockLevel: 10, unitPrice: 240, restaurantId: restaurant.id } }),
    prisma.ingredient.create({ data: { name: "Tomato", unit: "kg", currentStock: 12, minStockLevel: 5, maxStockLevel: 20, unitPrice: 40, restaurantId: restaurant.id } }),
    prisma.ingredient.create({ data: { name: "Onion", unit: "kg", currentStock: 10, minStockLevel: 5, maxStockLevel: 25, unitPrice: 35, restaurantId: restaurant.id } }),
    prisma.ingredient.create({ data: { name: "Wheat Flour", unit: "kg", currentStock: 20, minStockLevel: 5, maxStockLevel: 40, unitPrice: 30, restaurantId: restaurant.id } }),
    prisma.ingredient.create({ data: { name: "Cooking Oil", unit: "litre", currentStock: 8, minStockLevel: 3, maxStockLevel: 15, unitPrice: 180, restaurantId: restaurant.id } }),
    prisma.ingredient.create({ data: { name: "Spices (Mixed)", unit: "kg", currentStock: 3, minStockLevel: 1, maxStockLevel: 5, unitPrice: 500, restaurantId: restaurant.id } }),
    prisma.ingredient.create({ data: { name: "Milk", unit: "litre", currentStock: 2, minStockLevel: 5, maxStockLevel: 15, unitPrice: 60, restaurantId: restaurant.id } }),
    prisma.ingredient.create({ data: { name: "Butter", unit: "kg", currentStock: 4, minStockLevel: 2, maxStockLevel: 8, unitPrice: 480, restaurantId: restaurant.id } }),
    prisma.ingredient.create({ data: { name: "Yogurt", unit: "kg", currentStock: 6, minStockLevel: 3, maxStockLevel: 10, unitPrice: 80, restaurantId: restaurant.id } }),
    prisma.ingredient.create({ data: { name: "Fish (Rohu)", unit: "kg", currentStock: 0, minStockLevel: 3, maxStockLevel: 10, unitPrice: 350, restaurantId: restaurant.id } }),
    prisma.ingredient.create({ data: { name: "Green Vegetables", unit: "kg", currentStock: 4, minStockLevel: 3, maxStockLevel: 10, unitPrice: 50, restaurantId: restaurant.id } }),
    prisma.ingredient.create({ data: { name: "Lentils (Dal)", unit: "kg", currentStock: 10, minStockLevel: 5, maxStockLevel: 20, unitPrice: 90, restaurantId: restaurant.id } }),
  ])
  console.log(`Created ${ingredients.length} ingredients`)

  console.log("\n✅ Seed complete! Login credentials:")
  console.log("   Owner:   aman@tandooriflame.in / password123")
  console.log("   Waiter:  vikram@tandooriflame.in / password123")
  console.log("   Chef:    mohan@tandooriflame.in / password123")
  console.log("   Cashier: priya@tandooriflame.in / password123")
}

main()
  .catch((e) => {
    console.error("Seed failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
