import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Default Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const userId = 'usr_' + Math.random().toString(36).substring(2, 9);
  
  await sql`
    INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
    VALUES (${userId}, 'admin@pos.com', 'Admin Cashier', ${hashedPassword}, 'ADMIN', NOW(), NOW())
    ON CONFLICT (email) DO NOTHING;
  `;

  // 2. Create Categories
  const catDrinks = 'cat_drinks';
  const catBakery = 'cat_bakery';
  const catSnacks = 'cat_snacks';

  await sql`
    INSERT INTO "Category" (id, name, description, "createdAt")
    VALUES 
      (${catDrinks}, 'Beverages', 'Hot and cold beverages, coffee, and sodas', NOW()),
      (${catBakery}, 'Bakery & Bread', 'Fresh pastries, bread, and cakes', NOW()),
      (${catSnacks}, 'Snacks', 'Chips, crackers, and confectioneries', NOW())
    ON CONFLICT (name) DO NOTHING;
  `;

  // 3. Create Sample Products
  const products = [
    { id: 'prod_1', name: 'Iced Latte (Amazon Style)', barcode: '88501230001', price: 2.25, cost: 1.00, stock: 45, minStock: 10, categoryId: catDrinks },
    { id: 'prod_2', name: 'Green Tea Frappe', barcode: '88501230002', price: 2.75, cost: 1.20, stock: 30, minStock: 8, categoryId: catDrinks },
    { id: 'prod_3', name: 'Fresh Milk 500ml', barcode: '88501230003', price: 1.50, cost: 0.90, stock: 20, minStock: 5, categoryId: catDrinks },
    { id: 'prod_4', name: 'Butter Croissant', barcode: '88501230004', price: 1.80, cost: 0.80, stock: 15, minStock: 5, categoryId: catBakery },
    { id: 'prod_5', name: 'Chocolate Muffin', barcode: '88501230005', price: 2.00, cost: 0.85, stock: 4, minStock: 6, categoryId: catBakery }, // low stock
    { id: 'prod_6', name: 'Cheese Bagel', barcode: '88501230006', price: 2.50, cost: 1.10, stock: 12, minStock: 5, categoryId: catBakery },
    { id: 'prod_7', name: "Lay's Potato Chips (Classic)", barcode: '88501230007', price: 1.25, cost: 0.60, stock: 50, minStock: 15, categoryId: catSnacks },
    { id: 'prod_8', name: 'Pringles Sour Cream & Onion', barcode: '88501230008', price: 2.10, cost: 1.10, stock: 3, minStock: 10, categoryId: catSnacks }, // low stock
    { id: 'prod_9', name: 'Mineral Water 500ml', barcode: '88501230009', price: 0.50, cost: 0.20, stock: 120, minStock: 25, categoryId: catDrinks },
  ];

  for (const p of products) {
    await sql`
      INSERT INTO "Product" (id, name, barcode, price, cost, stock, "minStock", "categoryId", "createdAt", "updatedAt")
      VALUES (${p.id}, ${p.name}, ${p.barcode}, ${p.price}, ${p.cost}, ${p.stock}, ${p.minStock}, ${p.categoryId}, NOW(), NOW())
      ON CONFLICT (barcode) DO UPDATE SET stock = ${p.stock}, price = ${p.price};
    `;
  }

  // 4. Create Initial Sale to demonstrate history and relations
  const saleId = 'sale_init_001';
  const invoiceNum = 'INV-2026-0001';
  
  await sql`
    INSERT INTO "Sale" (id, "invoiceNumber", "userId", "totalAmount", "receivedAmount", "changeAmount", "paymentMethod", status, notes, "createdAt")
    VALUES (${saleId}, ${invoiceNum}, (SELECT id FROM "User" LIMIT 1), 6.50, 10.00, 3.50, 'CASH', 'COMPLETED', 'First test transaction', NOW())
    ON CONFLICT ("invoiceNumber") DO NOTHING;
  `;

  await sql`
    INSERT INTO "SaleItem" (id, "saleId", "productId", quantity, "unitPrice", subtotal)
    VALUES 
      ('item_1', ${saleId}, 'prod_1', 2, 2.25, 4.50),
      ('item_2', ${saleId}, 'prod_4', 1, 2.00, 2.00)
    ON CONFLICT (id) DO NOTHING;
  `;

  console.log('✅ Seed completed with default admin, categories, products, and a sample transaction!');
}

main().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
