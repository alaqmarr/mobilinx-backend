// app/api/variants/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const variants = await prisma.coverVariant.findMany();
    return NextResponse.json(variants);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch variants' },
      { status: 500 }
    );
  }
}