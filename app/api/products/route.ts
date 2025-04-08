// app/api/products/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
export async function GET() {
  try {
    const products = await prisma.coverProduct.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        variants: true,
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Create the product
    const product = await prisma.coverProduct.create({
      data: {
        name: body.name,
        description: body.description,
        variants: {
          create: body.variants.map((variant: any) => ({
            phoneModelId: variant.phoneModelId,
            price: variant.price,
            quantity: variant.quantity,
            imageUrl: variant.imageUrl,
            isActive: variant.isActive,
          })),
        },
      },
      include: {
        variants: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}