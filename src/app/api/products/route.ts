import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

// GET products with search, category filtering, and pagination
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';

    let products;
    if (search && categoryId) {
      products = await sql`
        SELECT p.*, c.name as "categoryName"
        FROM "Product" p
        JOIN "Category" c ON p."categoryId" = c.id
        WHERE (p.name ILIKE ${'%' + search + '%'} OR p.barcode ILIKE ${'%' + search + '%'})
          AND p."categoryId" = ${categoryId}
        ORDER BY p.name ASC
      `;
    } else if (search) {
      products = await sql`
        SELECT p.*, c.name as "categoryName"
        FROM "Product" p
        JOIN "Category" c ON p."categoryId" = c.id
        WHERE p.name ILIKE ${'%' + search + '%'} OR p.barcode ILIKE ${'%' + search + '%'}
        ORDER BY p.name ASC
      `;
    } else if (categoryId) {
      products = await sql`
        SELECT p.*, c.name as "categoryName"
        FROM "Product" p
        JOIN "Category" c ON p."categoryId" = c.id
        WHERE p."categoryId" = ${categoryId}
        ORDER BY p.name ASC
      `;
    } else {
      products = await sql`
        SELECT p.*, c.name as "categoryName"
        FROM "Product" p
        JOIN "Category" c ON p."categoryId" = c.id
        ORDER BY p.name ASC
      `;
    }

    const categories = await sql`SELECT * FROM "Category" ORDER BY name ASC`;

    return NextResponse.json({ products, categories });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create product
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, barcode, price, cost, stock, minStock, categoryId, imageUrl } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 });
    }

    const id = 'prod_' + Math.random().toString(36).substring(2, 9);
    const result = await sql`
      INSERT INTO "Product" (id, name, barcode, price, cost, stock, "minStock", "categoryId", "imageUrl", "createdAt", "updatedAt")
      VALUES (${id}, ${name}, ${barcode || null}, ${price}, ${cost || 0}, ${stock || 0}, ${minStock || 5}, ${categoryId}, ${imageUrl || null}, NOW(), NOW())
      RETURNING *
    `;

    return NextResponse.json({ product: result[0] });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update product
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, barcode, price, cost, stock, minStock, categoryId } = body;

    if (!id || !name || !price || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await sql`
      UPDATE "Product"
      SET name = ${name}, barcode = ${barcode || null}, price = ${price}, cost = ${cost || 0},
          stock = ${stock || 0}, "minStock" = ${minStock || 5}, "categoryId" = ${categoryId}, "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ product: result[0] });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await sql`DELETE FROM "Product" WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
