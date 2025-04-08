// app/dashboard/models/page.tsx
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

type Series = {
  id: string;
  name: string;
  brand: {
    id: string;
    name: string;
  };
};

type PhoneModel = {
  id: string;
  name: string;
  series: Series;
  createdAt: string;
};

export default function ModelsPage() {
  const searchParams = useParams();
    const seriesId = searchParams.id;
  const [name, setName] = useState('');
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [series, setSeries] = useState<Series | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch series and models on mount
  useEffect(() => {
    if (!seriesId) {
      router.push('/dashboard/brands');
      return;
    }

    const fetchData = async () => {
      try {
        const [seriesRes, modelsRes] = await Promise.all([
          fetch(`/api/series/${seriesId}`),
          fetch(`/api/models/${seriesId}`),
        ]);

        if (!seriesRes.ok || !modelsRes.ok) throw new Error('Failed to fetch data');

        const seriesData = await seriesRes.json();
        const modelsData = await modelsRes.json();

        setSeries(seriesData);
        setModels(modelsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [seriesId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Model name is required');
      return;
    }
    if (!seriesId) return;

    const loadingToast = toast.loading('Creating model...');
    
    try {
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, seriesId }),
      });

      if (!response.ok) throw new Error('Failed to create model');

      const newModel = await response.json();
      setModels([...models, newModel]);
      setName('');
      toast.success('Model created successfully', { id: loadingToast });
    } catch (error) {
      console.error('Error creating model:', error);
      toast.error('Failed to create model', { id: loadingToast });
    }
  };

  const handleDelete = async (id: string) => {
    const loadingToast = toast.loading('Deleting model...');
    
    try {
      const response = await fetch(`/api/models/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete model');

      setModels(models.filter(m => m.id !== id));
      toast.success('Model deleted successfully', { id: loadingToast });
    } catch (error) {
      console.error('Error deleting model:', error);
      toast.error('Failed to delete model', { id: loadingToast });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-gray-500">Series not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push(`/dashboard/series/${series.brand.id}`)}
        >
          <ArrowLeft size={16} />
          Back to Series
        </Button>
        <span className="text-sm text-gray-500">
          {series.brand.name} &gt; {series.name}
        </span>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Model Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Add Model Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Add New Model</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="model-name">Model Name</Label>
              <Input
                id="model-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`e.g. ${series.name} 15 Pro, ${series.name} S24`}
              />
            </div>
            <Button type="submit" className="gap-2">
              <Plus size={16} />
              Add Model
            </Button>
          </form>
        </div>

        {/* Models List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Existing Models</h2>
          {models.length === 0 ? (
            <p className="text-gray-500">No models found for this series</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model Name</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell>{model.name}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(model.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
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