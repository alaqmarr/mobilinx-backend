// app/api/models/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all models for a series
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const seriesId = searchParams.get('seriesId');
    
    if (!seriesId) {
      const models = await prisma.phoneModel.findMany({
        orderBy: { name: 'asc' },
        include: { series: { include: { brand: true } } },
      });
        return NextResponse.json(models);
    }
    
    const models = await prisma.phoneModel.findMany({
      where: { seriesId },
      orderBy: { name: 'asc' },
      include: { series: { include: { brand: true } } },
    });
    
    return NextResponse.json(models);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}

// POST create new model
export async function POST(req: Request) {
  try {
    const { name, seriesId } = await req.json();
    
    const model = await prisma.phoneModel.create({
      data: { name, seriesId },
      include: { series: { include: { brand: true } } },
    });
    
    return NextResponse.json(model);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    );
  }
}

// DELETE model
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    
    await prisma.phoneModel.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete model' },
      { status: 500 }
    );
  }
}