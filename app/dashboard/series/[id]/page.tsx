// app/dashboard/series/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

type Brand = {
  id: string;
  name: string;
};

type Series = {
  id: string;
  name: string;
  brand: Brand;
  createdAt: string;
};

export default function SeriesPage() {
  const searchParams = useParams();
  const brandId = searchParams.id;
  const [name, setName] = useState('');
  const [series, setSeries] = useState<Series[]>([]);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch brand and series on mount
  useEffect(() => {
    if (!brandId) {
      router.push('/dashboard/brands');
      return;
    }

    const fetchData = async () => {
      try {
        const [brandRes, seriesRes] = await Promise.all([
          fetch(`/api/brands/${brandId}`),
          fetch(`/api/series?brandId=${brandId}`),
        ]);

        if (!brandRes.ok || !seriesRes.ok) throw new Error('Failed to fetch data');

        const brandData = await brandRes.json();
        const seriesData = await seriesRes.json();

        setBrand(brandData);
        setSeries(seriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [brandId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Series name is required');
      return;
    }
    if (!brandId) return;

    const loadingToast = toast.loading('Creating series...');
    
    try {
      const response = await fetch('/api/series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, brandId }),
      });

      if (!response.ok) throw new Error('Failed to create series');

      const newSeries = await response.json();
      setSeries([...series, newSeries]);
      setName('');
      toast.success('Series created successfully', { id: loadingToast });
    } catch (error) {
      console.error('Error creating series:', error);
      toast.error('Failed to create series', { id: loadingToast });
    }
  };

  const handleDelete = async (id: string) => {
    const loadingToast = toast.loading('Deleting series...');
    
    try {
      const response = await fetch(`/api/series/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete series');

      setSeries(series.filter(s => s.id !== id));
      toast.success('Series deleted successfully', { id: loadingToast });
    } catch (error) {
      console.error('Error deleting series:', error);
      toast.error('Failed to delete series', { id: loadingToast });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-gray-500">Brand not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-4 gap-2"
        onClick={() => router.push('/dashboard/brands')}
      >
        <ArrowLeft size={16} />
        Back to Brands
      </Button>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Series Management: {brand.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Add Series Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Add New Series</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="series-name">Series Name</Label>
              <Input
                id="series-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`e.g. iPhone, Galaxy, ${brand.name} [Series Name]`}
              />
            </div>
            <Button type="submit" className="gap-2">
              <Plus size={16} />
              Add Series
            </Button>
          </form>
        </div>

        {/* Series List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Existing Series</h2>
          {series.length === 0 ? (
            <p className="text-gray-500">No series found for this brand</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Series Name</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {series.map((serie) => (
                    <TableRow key={serie.id}>
                      <TableCell>{serie.name}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/models/${serie.id}`)}
                          >
                            View Models
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(serie.id)}
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