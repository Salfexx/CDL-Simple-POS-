# 🎙️ Video Demo Script (3–5 Minutes)
**Project:** Simple POS (Point of Sale)  
**Student:** Cambodia Digital Literacy (CDL)  
**Tech:** Next.js 16 (App Router), Neon PostgreSQL, Prisma ORM, Vercel  

---

### Part 1: Introduction (0:00 – 0:45)
- **Greeting:** "Hello teacher and everyone. My name is [Your Name], and this is my Final Project for Cambodia Digital Literacy: **Simple POS Web Application**."
- **Problem Statement:** "Small retail shops and marts need an easy way to ring up items, track inventory, auto-deduct stock, and view real-time sales reports without costly proprietary POS hardware."
- **Tech Stack Highlights:** 
  - Frontend & Backend: Next.js 16 with App Router and Route Handlers.
  - Database: Serverless Neon PostgreSQL with 5 relational tables (`User`, `Category`, `Product`, `Sale`, `SaleItem`).
  - Deployment: Hosted live on Vercel.

---

### Part 2: Feature Walkthrough (0:45 – 2:45)
1. **Dashboard (`/dashboard`):**
   - "Here on the dashboard, we have real-time metrics showing Today's Sales, Month's Sales, Total Inventory, and Low Stock alerts."
   - "Below we see the Top 5 best-selling products and a payment method breakdown."
2. **POS Cashier Terminal (`/pos`):**
   - "Let's go to the POS Terminal. We can filter products by categories (Beverages, Bakery, Snacks) or search by name and barcode."
   - "Notice the stock badges: Green for in-stock, yellow for low-stock, and red for out-of-stock."
   - "Let's add 2 Iced Lattes and 1 Croissant to the cart. We can increment or decrement quantity."
   - "Click 'Proceed to Payment'. We can choose Cash, Bakong KHQR, or Card. If Cash, enter $10 — it calculates change ($3.50) automatically."
   - "Click 'Confirm Sale'. The transaction completes instantly, and a printable receipt modal appears with the invoice number."
3. **Auto-Stock Deduction Proof:**
   - "Now let's check the product stock. The Iced Latte stock automatically decreased by 2 units in Neon PostgreSQL in real-time."
4. **Product Management & CRUD (`/products`):**
   - "On the Products page, we have search and pagination."
   - "We can add a new product with price, barcode, and low-stock threshold, or edit and delete existing items."
5. **Sales History & Reports (`/sales` & `/reports`):**
   - "Under Sales History, every past invoice is preserved. We can re-open any receipt to print."
   - "In the Reports section, we can view sales velocity and click 'Export CSV Report' to download the spreadsheet."

---

### Part 3: Code Architecture & Database Walkthrough (2:45 – 3:45)
- **Database Schema (`prisma/schema.prisma`):**
  - "Here in `prisma/schema.prisma`, we have 5 relational models. `Product` belongs to `Category`. `Sale` connects to `User` and has many `SaleItem` records with foreign keys."
- **API & Auto-Deduction Logic (`src/app/api/sales/route.ts`):**
  - "In `src/app/api/sales/route.ts`, when a checkout request arrives, we insert the Sale and line items, and run an `UPDATE \"Product\" SET stock = GREATEST(0, stock - quantity)` to guarantee database consistency."
- **Next.js Structure:**
  - "We have a modular folder structure in `src/app` with clean client/server separation and Tailwind CSS for mobile responsiveness."

---

### Part 4: Conclusion (3:45 – 4:00)
- "The project is pushed to GitHub with clean commits and deployed live on Vercel with all environment variables securely configured. Thank you for watching!"
