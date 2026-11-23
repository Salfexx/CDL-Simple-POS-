import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

// GET sales history
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    let sales;
    if (search) {
      sales = await sql`
        SELECT s.*, u.name as "cashierName"
        FROM "Sale" s
        JOIN "User" u ON s."userId" = u.id
        WHERE s."invoiceNumber" ILIKE ${'%' + search + '%'}
        ORDER BY s."createdAt" DESC
        LIMIT 100
      `;
    } else {
      sales = await sql`
        SELECT s.*, u.name as "cashierName"
        FROM "Sale" s
        JOIN "User" u ON s."userId" = u.id
        ORDER BY s."createdAt" DESC
        LIMIT 100
      `;
    }

    // Attach items for each sale
    const saleIds = sales.map((s: any) => s.id);
    let items: any[] = [];
    if (saleIds.length > 0) {
      items = await sql`
        SELECT si.*, p.name as "productName"
        FROM "SaleItem" si
        JOIN "Product" p ON si."productId" = p.id
        WHERE si."saleId" = ANY(${saleIds})
      `;
    }

    const salesWithItems = sales.map((sale: any) => ({
      ...sale,
      items: items.filter((it: any) => it.saleId === sale.id),
    }));

    return NextResponse.json({ sales: salesWithItems });
  } catch (error: any) {
    console.error('Fetch sales error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create a new sale (auto-decrements stock)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, paymentMethod, receivedAmount, notes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart cannot be empty' }, { status: 400 });
    }

    // 1. Calculate total
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.quantity * item.unitPrice;
    }

    const received = parseFloat(receivedAmount) || totalAmount;
    const change = Math.max(0, received - totalAmount);

    // Get an active user/cashier
    const users = await sql`SELECT id FROM "User" LIMIT 1`;
    const userId = users[0]?.id || 'usr_default';

    // Generate Invoice Number: INV-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;
    const saleId = 'sale_' + Math.random().toString(36).substring(2, 9);

    // 2. Insert Sale
    await sql`
      INSERT INTO "Sale" (id, "invoiceNumber", "userId", "totalAmount", "receivedAmount", "changeAmount", "paymentMethod", status, notes, "createdAt")
      VALUES (${saleId}, ${invoiceNumber}, ${userId}, ${totalAmount}, ${received}, ${change}, ${paymentMethod || 'CASH'}, 'COMPLETED', ${notes || null}, NOW())
    `;

    // 3. Insert SaleItems and Auto-Deduct Stock from Products
    for (const item of items) {
      const subtotal = item.quantity * item.unitPrice;
      const itemId = 'item_' + Math.random().toString(36).substring(2, 9);

      await sql`
        INSERT INTO "SaleItem" (id, "saleId", "productId", quantity, "unitPrice", subtotal)
        VALUES (${itemId}, ${saleId}, ${item.productId}, ${item.quantity}, ${item.unitPrice}, ${subtotal})
      `;

      // Auto-Deduct Stock (assignment must-have)
      await sql`
        UPDATE "Product"
        SET stock = GREATEST(0, stock - ${item.quantity}), "updatedAt" = NOW()
        WHERE id = ${item.productId}
      `;
    }

    return NextResponse.json({
      success: true,
      sale: {
        id: saleId,
        invoiceNumber,
        totalAmount,
        receivedAmount: received,
        changeAmount: change,
        paymentMethod: paymentMethod || 'CASH',
        items,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
