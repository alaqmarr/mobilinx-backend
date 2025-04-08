// app/api/series/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all series for a brand
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const brandId = (await params).id;
    
    if (!brandId) {
      return NextResponse.json(
        { error: 'brandId is required' },
        { status: 400 }
      );
    }
    
    const series = await prisma.series.findMany({
      where: { brandId },
      orderBy: { name: 'asc' },
      include: { brand: true },
    });
    
    return NextResponse.json(series);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}

// POST create new series
export async function POST(req: Request) {
  try {
    const { name, brandId } = await req.json();
    
    const series = await prisma.series.create({
      data: { name, brandId },
      include: { brand: true },
    });
    
    return NextResponse.json(series);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create series' },
      { status: 500 }
    );
  }
}

// DELETE series
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    
    await prisma.series.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete series' },
      { status: 500 }
    );
  }
}