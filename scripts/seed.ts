/**
 * Database seeder – fills the DB with sample categories, products, orders, and an admin user.
 *
 * Run: npm run seed
 * Env: MONGODB_URI required (copy from .env.local or set in shell)
 *
 * Use --force to clear existing categories/products/orders before seeding (user is never deleted).
 */

import * as fs from "fs";
import * as path from "path";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^\s*([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = value;
      }
    }
  }
}
loadEnvLocal();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Set it in .env.local or pass it when running.");
  process.exit(1);
}

const force = process.argv.includes("--force");

async function run() {
  await mongoose.connect(MONGODB_URI as string, { bufferCommands: false });
  console.log("Connected to MongoDB\n");

  const db = mongoose.connection.db;
  if (!db) throw new Error("No db");

  if (force) {
    const collections = await db.listCollections().toArray();
    for (const { name } of collections) {
      if (name !== "users") {
        await db.collection(name).deleteMany({});
        console.log(`Cleared collection: ${name}`);
      }
    }
    console.log("");
  }

  const Category = mongoose.model(
    "Category",
    new mongoose.Schema(
      {
        name: {
          en: { type: String, required: true },
          ar: { type: String, required: true },
        },
        image: { type: String, required: true },
      },
      { timestamps: true }
    )
  );

  const Product = mongoose.model(
    "Product",
    new mongoose.Schema(
      {
        name: { en: String, ar: String },
        description: { en: String, ar: String },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        rating: { type: Number, default: 0 },
        price: { type: Number, required: true },
        is_available: { type: Boolean, default: true },
        total_order: { type: Number, default: 0 },
        extras: [{ name: String, price: Number }],
        sizes: [{ name: String, price: Number }],
        image: { type: String, default: "/placeholder.svg" },
      },
      { timestamps: true }
    )
  );

  const Order = mongoose.model(
    "Order",
    new mongoose.Schema(
      {
        products: [
          {
            _id: mongoose.Schema.Types.ObjectId,
            name: String,
            quantity: Number,
            size: String,
            pricePerItem: Number,
            extras: [String],
          },
        ],
        customerName: String,
        tableNumber: Number,
        totalPrice: Number,
        status: {
          type: String,
          enum: ["pending", "in-progress", "completed", "cancelled"],
          default: "pending",
        },
      },
      { timestamps: true }
    )
  );

  const User = mongoose.model(
    "User",
    new mongoose.Schema(
      {
        name: String,
        email: { type: String, unique: true },
        password: String,
        role: { type: String, enum: ["admin", "staff"], default: "admin" },
      },
      { timestamps: true }
    )
  );

  const existingCategories = await Category.countDocuments();
  if (existingCategories > 0 && !force) {
    console.log("Categories already exist. Use --force to clear and re-seed.\n");
    await mongoose.disconnect();
    process.exit(0);
  }

  const categoriesData = [
    { name: { en: "Hot Drinks", ar: "مشروبات ساخنة" }, image: "/placeholder.svg" },
    { name: { en: "Cold Drinks", ar: "مشروبات باردة" }, image: "/placeholder.svg" },
    { name: { en: "Arabic Coffee", ar: "قهوة عربية" }, image: "/placeholder.svg" },
    { name: { en: "Desserts", ar: "حلويات" }, image: "/placeholder.svg" },
    { name: { en: "Snacks", ar: "وجبات خفيفة" }, image: "/placeholder.svg" },
    { name: { en: "Fresh Juices", ar: "عصائر طازجة" }, image: "/placeholder.svg" },
    { name: { en: "Bakery", ar: "مخبوزات" }, image: "/placeholder.svg" },
    { name: { en: "Sandwiches", ar: "سندويشات" }, image: "/placeholder.svg" },
    { name: { en: "Breakfast", ar: "إفطار" }, image: "/placeholder.svg" },
    { name: { en: "Smoothies", ar: "سموذي" }, image: "/placeholder.svg" },
    { name: { en: "Tea", ar: "شاي" }, image: "/placeholder.svg" },
    { name: { en: "Ice Cream", ar: "آيس كريم" }, image: "/placeholder.svg" },
  ];

  const categories = await Category.insertMany(categoriesData);
  console.log(`Created ${categories.length} categories`);

  const [
    hotDrinksId,
    coldDrinksId,
    arabicCoffeeId,
    dessertsId,
    snacksId,
    freshJuicesId,
    bakeryId,
    sandwichesId,
    breakfastId,
    smoothiesId,
    teaId,
    iceCreamId,
  ] = categories.map((c) => c._id);

  const productsData = [
    { name: { en: "Espresso", ar: "إسبريسو" }, description: { en: "Strong Italian coffee", ar: "قهوة إيطالية قوية" }, category: hotDrinksId, price: 12, sizes: [{ name: "Single", price: 12 }, { name: "Double", price: 18 }] },
    { name: { en: "Cappuccino", ar: "كابتشينو" }, description: { en: "Espresso with steamed milk foam", ar: "إسبريسو مع رغوة الحليب البخاري" }, category: hotDrinksId, price: 15, sizes: [{ name: "Small", price: 15 }, { name: "Large", price: 20 }] },
    { name: { en: "Hot Chocolate", ar: "شوكولاتة ساخنة" }, description: { en: "Rich cocoa drink", ar: "كاكاو غني بالشوكولاتة" }, category: hotDrinksId, price: 14, sizes: [{ name: "Regular", price: 14 }] },
    { name: { en: "Latte", ar: "لاتيه" }, description: { en: "Smooth espresso with milk", ar: "إسبريسو ناعم مع الحليب" }, category: hotDrinksId, price: 16, sizes: [{ name: "Regular", price: 16 }, { name: "Large", price: 21 }] },
    { name: { en: "Mocha", ar: "موكا" }, description: { en: "Chocolate espresso drink", ar: "قهوة إسبريسو بالشوكولاتة" }, category: hotDrinksId, price: 18, sizes: [{ name: "Regular", price: 18 }] },
    { name: { en: "Iced Latte", ar: "لاتيه مثلج" }, description: { en: "Cold espresso with milk", ar: "إسبريسو بارد مع الحليب" }, category: coldDrinksId, price: 18, sizes: [{ name: "Regular", price: 18 }, { name: "Large", price: 22 }] },
    { name: { en: "Iced Americano", ar: "أمريكانو مثلج" }, description: { en: "Chilled espresso with water", ar: "إسبريسو بارد مع الماء" }, category: coldDrinksId, price: 14, sizes: [{ name: "Regular", price: 14 }] },
    { name: { en: "Cold Brew", ar: "قهوة باردة" }, description: { en: "Slow-steeped cold coffee", ar: "قهوة منقوعة على البارد" }, category: coldDrinksId, price: 16, sizes: [{ name: "Regular", price: 16 }, { name: "Large", price: 20 }] },
    { name: { en: "Saudi Arabic Coffee", ar: "قهوة عربية سعودية" }, description: { en: "Traditional cardamom coffee from the dallah", ar: "قهوة هيل تقليدية من الدلة" }, category: arabicCoffeeId, price: 8, sizes: [{ name: "Cup", price: 8 }, { name: "Dallah", price: 25 }] },
    { name: { en: "Arabic Coffee with Saffron", ar: "قهوة عربية بالزعفران" }, description: { en: "Arabic coffee with a touch of saffron", ar: "قهوة عربية مع لمسة زعفران" }, category: arabicCoffeeId, price: 12, sizes: [{ name: "Cup", price: 12 }] },
    { name: { en: "Chocolate Cake", ar: "كيكة شوكولاتة" }, description: { en: "Rich chocolate layer cake", ar: "كيكة شوكولاتة غنية بالطبقات" }, category: dessertsId, price: 25, sizes: [{ name: "Slice", price: 25 }, { name: "Whole", price: 120 }] },
    { name: { en: "Kunafa", ar: "كنافة" }, description: { en: "Crispy pastry with sweet cheese", ar: "كنافة مقرمشة مع جبنة حلوة" }, category: dessertsId, price: 22, sizes: [{ name: "Regular", price: 22 }, { name: "Large", price: 35 }] },
    { name: { en: "Umm Ali", ar: "أم علي" }, description: { en: "Egyptian bread pudding with nuts", ar: "حلويات أم علي بالمكسرات" }, category: dessertsId, price: 18, sizes: [{ name: "Regular", price: 18 }] },
    { name: { en: "Basbousa", ar: "بسبوسة" }, description: { en: "Semolina cake with syrup", ar: "كيكة سميد بالقطر" }, category: dessertsId, price: 12, sizes: [{ name: "Piece", price: 12 }] },
    { name: { en: "Baklava", ar: "بقلاوة" }, description: { en: "Layered pastry with nuts and syrup", ar: "فطائر بالمكسرات والقطر" }, category: dessertsId, price: 20, sizes: [{ name: "3 pcs", price: 20 }, { name: "6 pcs", price: 38 }] },
    { name: { en: "Mixed Nuts", ar: "مكسرات مشكلة" }, description: { en: "Roasted mixed nuts", ar: "مكسرات محمصة مشكلة" }, category: snacksId, price: 15, sizes: [{ name: "Small", price: 15 }, { name: "Large", price: 25 }] },
    { name: { en: "Dates Plate", ar: "طبق تمر" }, description: { en: "Assorted Saudi dates", ar: "تمر سعودي مشكل" }, category: snacksId, price: 18, sizes: [{ name: "Small", price: 18 }, { name: "Large", price: 35 }] },
    { name: { en: "Hummus with Bread", ar: "حمص مع خبز" }, description: { en: "Creamy hummus with fresh bread", ar: "حمص كريمي مع خبز طازج" }, category: snacksId, price: 14, sizes: [{ name: "Regular", price: 14 }] },
    { name: { en: "Fresh Orange Juice", ar: "عصير برتقال طازج" }, description: { en: "Freshly squeezed oranges", ar: "عصير برتقال معصور طازج" }, category: freshJuicesId, price: 16, sizes: [{ name: "Regular", price: 16 }, { name: "Large", price: 22 }] },
    { name: { en: "Pomegranate Juice", ar: "عصير رمان" }, description: { en: "Fresh pomegranate juice", ar: "عصير رمان طازج" }, category: freshJuicesId, price: 20, sizes: [{ name: "Regular", price: 20 }, { name: "Large", price: 28 }] },
    { name: { en: "Date Juice", ar: "عصير تمر" }, description: { en: "Traditional Saudi date juice", ar: "عصير تمر تقليدي سعودي" }, category: freshJuicesId, price: 14, sizes: [{ name: "Regular", price: 14 }] },
    { name: { en: "Mango Juice", ar: "عصير مانجو" }, description: { en: "Fresh mango juice", ar: "عصير مانجو طازج" }, category: freshJuicesId, price: 18, sizes: [{ name: "Regular", price: 18 }, { name: "Large", price: 24 }] },
    { name: { en: "Strawberry Juice", ar: "عصير فراولة" }, description: { en: "Fresh strawberry juice", ar: "عصير فراولة طازج" }, category: freshJuicesId, price: 17, sizes: [{ name: "Regular", price: 17 }] },
    { name: { en: "Croissant", ar: "كرواسون" }, description: { en: "Buttery French pastry", ar: "معجنات فرنسية زبدية" }, category: bakeryId, price: 10, sizes: [{ name: "Plain", price: 10 }, { name: "Chocolate", price: 12 }] },
    { name: { en: "Pain au Chocolat", ar: "شوكولاتة بالزبدة" }, description: { en: "Chocolate-filled pastry", ar: "معجنات محشوة بالشوكولاتة" }, category: bakeryId, price: 14, sizes: [{ name: "Piece", price: 14 }] },
    { name: { en: "Saudi Bread", ar: "خبز سعودي" }, description: { en: "Traditional flatbread", ar: "خبز تنور تقليدي" }, category: bakeryId, price: 6, sizes: [{ name: "Piece", price: 6 }, { name: "Half dozen", price: 30 }] },
    { name: { en: "Muffin", ar: "مافن" }, description: { en: "Fresh baked muffin", ar: "مافن طازج من الفرن" }, category: bakeryId, price: 12, sizes: [{ name: "Blueberry", price: 12 }, { name: "Chocolate", price: 12 }] },
    { name: { en: "Brownie", ar: "براوني" }, description: { en: "Chocolate brownie", ar: "براوني شوكولاتة" }, category: bakeryId, price: 14, sizes: [{ name: "Piece", price: 14 }] },
    { name: { en: "Club Sandwich", ar: "سندويش كلوب" }, description: { en: "Triple-decker with chicken and bacon", ar: "سندويش ثلاثي بالدجاج" }, category: sandwichesId, price: 28, sizes: [{ name: "Half", price: 16 }, { name: "Full", price: 28 }] },
    { name: { en: "Grilled Cheese", ar: "سندويش جبن مشوي" }, description: { en: "Melted cheese on toast", ar: "جبنة ذائبة على توست" }, category: sandwichesId, price: 18, sizes: [{ name: "Regular", price: 18 }] },
    { name: { en: "Chicken Shawarma", ar: "شاورما دجاج" }, description: { en: "Grilled chicken in flatbread", ar: "دجاج مشوي في خبز عربي" }, category: sandwichesId, price: 22, sizes: [{ name: "Regular", price: 22 }, { name: "Large", price: 28 }] },
    { name: { en: "Falafel Sandwich", ar: "سندويش فلافل" }, description: { en: "Falafel with tahini in pita", ar: "فلافل مع طحينة في خبز بيتا" }, category: sandwichesId, price: 16, sizes: [{ name: "Regular", price: 16 }] },
    { name: { en: "Tuna Sandwich", ar: "سندويش تونا" }, description: { en: "Tuna with mayo and veggies", ar: "تونا مع مايونيز وخضار" }, category: sandwichesId, price: 20, sizes: [{ name: "Regular", price: 20 }] },
    { name: { en: "Eggs & Foul", ar: "بيض وفول" }, description: { en: "Egyptian-style breakfast", ar: "فطور بيض وفول بالطريقة العربية" }, category: breakfastId, price: 22, sizes: [{ name: "Regular", price: 22 }] },
    { name: { en: "Shakshuka", ar: "شكشوكة" }, description: { en: "Eggs in tomato sauce", ar: "بيض بصلصة الطماطم" }, category: breakfastId, price: 24, sizes: [{ name: "Regular", price: 24 }] },
    { name: { en: "Pancakes", ar: "بانكيك" }, description: { en: "Fluffy pancakes with syrup", ar: "بانكيك هش مع قطر" }, category: breakfastId, price: 20, sizes: [{ name: "3 pcs", price: 20 }, { name: "5 pcs", price: 28 }] },
    { name: { en: "Omelette", ar: "أومليت" }, description: { en: "Three-egg omelette with fillings", ar: "أومليت ثلاث بيضات مع حشوات" }, category: breakfastId, price: 22, sizes: [{ name: "Regular", price: 22 }] },
    { name: { en: "Berry Smoothie", ar: "سموذي توت" }, description: { en: "Mixed berries with yogurt", ar: "توت مشكل مع لبن" }, category: smoothiesId, price: 20, sizes: [{ name: "Regular", price: 20 }, { name: "Large", price: 26 }] },
    { name: { en: "Mango Smoothie", ar: "سموذي مانجو" }, description: { en: "Tropical mango blend", ar: "سموذي مانجو استوائي" }, category: smoothiesId, price: 19, sizes: [{ name: "Regular", price: 19 }] },
    { name: { en: "Avocado Smoothie", ar: "سموذي أفوكادو" }, description: { en: "Creamy avocado smoothie", ar: "سموذي أفوكادو كريمي" }, category: smoothiesId, price: 22, sizes: [{ name: "Regular", price: 22 }] },
    { name: { en: "Date Smoothie", ar: "سموذي تمر" }, description: { en: "Saudi dates with milk", ar: "تمر سعودي مع حليب" }, category: smoothiesId, price: 18, sizes: [{ name: "Regular", price: 18 }] },
    { name: { en: "Green Smoothie", ar: "سموذي أخضر" }, description: { en: "Spinach, banana, and apple", ar: "سبانخ وموز وتفاح" }, category: smoothiesId, price: 20, sizes: [{ name: "Regular", price: 20 }] },
    { name: { en: "Karak Chai", ar: "شاي كرك" }, description: { en: "Strong tea with milk and cardamom", ar: "شاي حليب قوي بالهيل" }, category: teaId, price: 8, sizes: [{ name: "Cup", price: 8 }, { name: "Pot", price: 18 }] },
    { name: { en: "Mint Tea", ar: "شاي نعناع" }, description: { en: "Green tea with fresh mint", ar: "شاي أخضر مع نعناع طازج" }, category: teaId, price: 10, sizes: [{ name: "Cup", price: 10 }] },
    { name: { en: "Earl Grey", ar: "شاي إيرل غراي" }, description: { en: "Classic bergamot tea", ar: "شاي إيرل غراي كلاسيكي" }, category: teaId, price: 9, sizes: [{ name: "Cup", price: 9 }] },
    { name: { en: "Vanilla Ice Cream", ar: "آيس كريم فانيلا" }, description: { en: "Classic vanilla", ar: "فانيلا كلاسيكي" }, category: iceCreamId, price: 14, sizes: [{ name: "1 scoop", price: 14 }, { name: "3 scoops", price: 35 }] },
    { name: { en: "Date Ice Cream", ar: "آيس كريم تمر" }, description: { en: "Saudi date flavoured ice cream", ar: "آيس كريم بنكهة التمر السعودي" }, category: iceCreamId, price: 16, sizes: [{ name: "1 scoop", price: 16 }, { name: "3 scoops", price: 40 }] },
    { name: { en: "Saffron Ice Cream", ar: "آيس كريم زعفران" }, description: { en: "Premium saffron ice cream", ar: "آيس كريم زعفران فاخر" }, category: iceCreamId, price: 18, sizes: [{ name: "1 scoop", price: 18 }] },
    { name: { en: "Chocolate Ice Cream", ar: "آيس كريم شوكولاتة" }, description: { en: "Rich chocolate", ar: "شوكولاتة غنية" }, category: iceCreamId, price: 15, sizes: [{ name: "1 scoop", price: 15 }, { name: "3 scoops", price: 38 }] },
    { name: { en: "Pistachio Ice Cream", ar: "آيس كريم فستق" }, description: { en: "Creamy pistachio", ar: "فستق كريمي" }, category: iceCreamId, price: 17, sizes: [{ name: "1 scoop", price: 17 }] },
  ].map((p) => ({ ...p, image: "/placeholder.svg" }));

  const products = await Product.insertMany(productsData);
  console.log(`Created ${products.length} products`);

  const statuses = ["pending", "in-progress", "completed", "completed", "cancelled"] as const;
  const customerNames = ["Ahmed", "Sara", "Omar", "Layla", "Khalid", "Nora", "Youssef", "Maha"];
  type ProductDoc = { _id: mongoose.Types.ObjectId; name: { en: string }; price: number; sizes: { name: string; price: number }[] };
  const ordersToInsert: Record<string, unknown>[] = [];

  for (let i = 0; i < 15; i++) {
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = [...products]
      .sort(() => Math.random() - 0.5)
      .slice(0, numItems) as ProductDoc[];
    const orderProducts = selectedProducts.map((p) => {
      const qty = Math.floor(Math.random() * 2) + 1;
      const size = p.sizes[0];
      const pricePerItem = size?.price ?? p.price;
      return {
        _id: p._id,
        name: p.name.en,
        quantity: qty,
        size: size?.name ?? "Regular",
        pricePerItem,
        extras: [],
      };
    });
    const totalPrice = orderProducts.reduce((sum, op) => sum + op.quantity * op.pricePerItem, 0);
    const daysAgo = Math.floor(Math.random() * 10);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    ordersToInsert.push({
      products: orderProducts,
      customerName: customerNames[i % customerNames.length],
      tableNumber: Math.floor(Math.random() * 15) + 1,
      totalPrice,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt,
      updatedAt: createdAt,
    });
  }

  await Order.insertMany(ordersToInsert);
  console.log(`Created ${ordersToInsert.length} orders`);

  const adminEmail = "admin@hatly.com";
  const existingUser = await User.findOne({ email: adminEmail });
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });
    console.log("Created admin user: admin@hatly.com / admin123");
  } else {
    console.log("Admin user already exists (admin@hatly.com)");
  }

  console.log("\nSeed completed successfully.");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
