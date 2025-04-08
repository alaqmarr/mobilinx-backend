// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Box, Layers, Smartphone, Grid, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<{
    brands: number;
    series: number;
    models: number;
    products: number;
    variants: number;
    recentProducts: { id: string; name: string }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch counts from your API endpoints
        const [brandsRes, seriesRes, modelsRes, productsRes, variantsRes] = await Promise.all([
          fetch('/api/brands'),
          fetch('/api/series'),
          fetch('/api/models'),
          fetch('/api/products'),
          fetch('/api/variants'),
        ]);

        if (!brandsRes.ok || !seriesRes.ok || !modelsRes.ok || !productsRes.ok || !variantsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [brands, series, models, products, variants] = await Promise.all([
          brandsRes.json(),
          seriesRes.json(),
          modelsRes.json(),
          productsRes.json(),
          variantsRes.json(),
        ]);

        // Get recent products (last 3 created)
        const recentProducts = products
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
          .map((product: any) => ({ id: product.id, name: product.name }));

        setStats({
          brands: brands.length,
          series: series.length,
          models: models.length,
          products: products.length,
          variants: variants.length,
          recentProducts,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Phone Case Management Dashboard</h1>
        <div className="flex gap-4">
          <Button onClick={() => router.push('/dashboard/covers/add')} className="gap-2">
            <Plus size={16} />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Brands Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Brands</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-2xl font-bold">{stats?.brands}</div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="ghost"
              className="w-full gap-2"
              onClick={() => router.push('/dashboard/brands')}
            >
              Manage Brands <ArrowRight size={16} />
            </Button>
          </CardFooter>
        </Card>

        {/* Series Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Series</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-2xl font-bold">{stats?.series}</div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="ghost"
              className="w-full gap-2"
              onClick={() => router.push('/dashboard/series')}
            >
              Manage Series <ArrowRight size={16} />
            </Button>
          </CardFooter>
        </Card>

        {/* Models Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Models</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-2xl font-bold">{stats?.models}</div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="ghost"
              className="w-full gap-2"
              onClick={() => router.push('/dashboard/models')}
            >
              Manage Models <ArrowRight size={16} />
            </Button>
          </CardFooter>
        </Card>

        {/* Products Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Grid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-2xl font-bold">{stats?.products}</div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="ghost"
              className="w-full gap-2"
              onClick={() => router.push('/products')}
            >
              View Products <ArrowRight size={16} />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : stats?.recentProducts && stats.recentProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.recentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => router.push(`/products/${product.id}`)}
                  >
                    <div className="font-medium">{product.name}</div>
                    <Badge variant="outline">View</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No products found
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-center">
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => router.push('/products')}
            >
              View All Products <ArrowRight size={16} />
            </Button>
          </CardFooter>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full gap-2 justify-start"
              onClick={() => router.push('/dashboard/brands')}
            >
              <Box size={16} />
              Manage Brands
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2 justify-start"
              onClick={() => router.push('/dashboard/series')}
            >
              <Layers size={16} />
              Manage Series
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2 justify-start"
              onClick={() => router.push('/dashboard/models')}
            >
              <Smartphone size={16} />
              Manage Models
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2 justify-start"
              onClick={() => router.push('/dashboard/covers/add')}
            >
              <Plus size={16} />
              Add New Product
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Variants Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Variants Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats?.variants}</div>
                <p className="text-sm text-muted-foreground">
                  Total variants across all products
                </p>
              </div>
              <Button
                variant="ghost"
                className="gap-2"
                onClick={() => router.push('/products')}
              >
                View Products <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}