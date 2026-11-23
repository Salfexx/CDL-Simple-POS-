import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET all categories
export async function GET() {
  try {
    const categories = await sql`
      SELECT c.*, COUNT(p.id) as "productCount"
      FROM "Category" c
      LEFT JOIN "Product" p ON c.id = p."categoryId"
      GROUP BY c.id
      ORDER BY c.name ASC
    `;
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create category
export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const id = 'cat_' + Math.random().toString(36).substring(2, 9);
    const result = await sql`
      INSERT INTO "Category" (id, name, description, "createdAt")
      VALUES (${id}, ${name}, ${description || null}, NOW())
      RETURNING *
    `;

    return NextResponse.json({ category: result[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE category
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await sql`DELETE FROM "Category" WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
