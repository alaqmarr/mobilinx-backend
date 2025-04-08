// app/api/brands/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all brands
export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(brands);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

// POST create new brand
export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    
    const brand = await prisma.brand.create({
      data: { name },
    });
    
    return NextResponse.json(brand);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    );
  }
}

// DELETE brand
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    
    await prisma.brand.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    );
  }
}