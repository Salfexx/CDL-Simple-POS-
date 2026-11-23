import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // 1. Total revenue today
    const todaySales = await sql`
      SELECT COALESCE(SUM("totalAmount"), 0) as total, COUNT(*) as count
      FROM "Sale"
      WHERE DATE("createdAt") = CURRENT_DATE
    `;

    // 2. Total revenue this month
    const monthSales = await sql`
      SELECT COALESCE(SUM("totalAmount"), 0) as total, COUNT(*) as count
      FROM "Sale"
      WHERE EXTRACT(MONTH FROM "createdAt") = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM "createdAt") = EXTRACT(YEAR FROM CURRENT_DATE)
    `;

    // 3. Total products and low stock items
    const inventoryStats = await sql`
      SELECT 
        COUNT(*) as "totalProducts",
        COUNT(CASE WHEN stock <= "minStock" THEN 1 END) as "lowStockCount"
      FROM "Product"
    `;

    // 4. Sales by payment method
    const paymentBreakdown = await sql`
      SELECT "paymentMethod", COUNT(*) as count, SUM("totalAmount") as total
      FROM "Sale"
      GROUP BY "paymentMethod"
    `;

    // 5. Top 5 selling products
    const topProducts = await sql`
      SELECT p.name, SUM(si.quantity) as "totalSold", SUM(si.subtotal) as "totalRevenue"
      FROM "SaleItem" si
      JOIN "Product" p ON si."productId" = p.id
      GROUP BY p.name
      ORDER BY "totalSold" DESC
      LIMIT 5
    `;

    // 6. Last 7 days sales for charts
    const recentTrend = await sql`
      SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as date, SUM("totalAmount") as total
      FROM "Sale"
      WHERE "createdAt" >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
      ORDER BY date ASC
    `;

    return NextResponse.json({
      todaySales: {
        total: parseFloat(todaySales[0].total),
        count: parseInt(todaySales[0].count),
      },
      monthSales: {
        total: parseFloat(monthSales[0].total),
        count: parseInt(monthSales[0].count),
      },
      inventory: {
        totalProducts: parseInt(inventoryStats[0].totalProducts),
        lowStockCount: parseInt(inventoryStats[0].lowStockCount),
      },
      paymentBreakdown,
      topProducts,
      recentTrend,
    });
  } catch (error: any) {
    console.error('Reports error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
