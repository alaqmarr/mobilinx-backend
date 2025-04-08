// app/dashboard/brands/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

type Brand = {
  id: string;
  name: string;
  createdAt: string;
};

export default function BrandsPage() {
  const [name, setName] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch brands on mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands');
        const data = await response.json();
        setBrands(data);
      } catch (error) {
        console.error('Error fetching brands:', error);
        toast.error('Failed to fetch brands');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Brand name is required');
      return;
    }

    const loadingToast = toast.loading('Creating brand...');
    
    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error('Failed to create brand');

      const newBrand = await response.json();
      setBrands([...brands, newBrand]);
      setName('');
      toast.success('Brand created successfully', { id: loadingToast });
    } catch (error) {
      console.error('Error creating brand:', error);
      toast.error('Failed to create brand', { id: loadingToast });
    }
  };

  const handleDelete = async (id: string) => {
    const loadingToast = toast.loading('Deleting brand...');
    
    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete brand');

      setBrands(brands.filter(brand => brand.id !== id));
      toast.success('Brand deleted successfully', { id: loadingToast });
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Failed to delete brand', { id: loadingToast });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Brand Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Add Brand Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Add New Brand</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="brand-name">Brand Name</Label>
              <Input
                id="brand-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apple, Samsung"
              />
            </div>
            <Button type="submit" className="gap-2">
              <Plus size={16} />
              Add Brand
            </Button>
          </form>
        </div>

        {/* Brands List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Existing Brands</h2>
          {brands.length === 0 ? (
            <p className="text-gray-500">No brands found</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand Name</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell>{brand.name}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/series/${brand.id}`)}
                          >
                            View Series
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(brand.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}