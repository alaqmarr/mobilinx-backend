// app/products/add/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import toast from "react-hot-toast";
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  variants: z.array(
    z.object({
      phoneModelId: z.string().min(1, "Model is required"),
      price: z.number().min(0, "Price must be positive"),
      quantity: z.number().min(0, "Quantity must be positive"),
      image: z.any(), // Will handle file upload separately
      isActive: z.boolean().default(true),
    })
  ).min(1, "At least one variant is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddProductPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [series, setSeries] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string>("");
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  // Fetch brands on mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands');
        const data = await response.json();
        setBrands(data);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };
    fetchBrands();
  }, []);

  // Fetch series when brand is selected
  useEffect(() => {
    if (selectedBrand) {
      const fetchSeries = async () => {
        try {
          const response = await fetch(`/api/series/${selectedBrand}`);
          const data = await response.json();
          setSeries(data);
          setSelectedSeries("");
          setModels([]);
          setSelectedModels([]);
        } catch (error) {
          console.error('Error fetching series:', error);
        }
      };
      fetchSeries();
    }
  }, [selectedBrand]);

  // Fetch models when series is selected
  useEffect(() => {
    if (selectedSeries) {
      const fetchModels = async () => {
        try {
          const response = await fetch(`/api/models/${selectedSeries}`);
          const data = await response.json();
          setModels(data);
          setSelectedModels([]);
        } catch (error) {
          console.error('Error fetching models:', error);
        }
      };
      fetchModels();
    }
  }, [selectedSeries]);

  // Add selected models to variants
  const handleAddModels = () => {
    const newModels = models
      .filter(model => selectedModels.includes(model.id))
      .filter(model => !fields.some(variant => variant.phoneModelId === model.id));

    newModels.forEach(model => {
      append({
        phoneModelId: model.id,
        price: 0,
        quantity: 0,
        image: null,
        isActive: true,
      });
    });
  };

  // Handle image upload
  const handleImageUpload = async (file: File, index: number) => {
    if (!file) return;

    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      form.setValue(`variants.${index}.image`, downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(":Failed to upload image");
      return null;
    }
  };

  // Submit form
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      // First upload all images
      const uploadPromises = data.variants.map(async (variant, index) => {
        if (variant.image instanceof File) {
          const url = await handleImageUpload(variant.image, index);
          return { ...variant, imageUrl: url };
        }
        return variant;
      });

      const variantsWithUrls: (FormValues['variants'][number] & { imageUrl?: string | null })[] = await Promise.all(uploadPromises);

      // Prepare the final data
      const productData = {
        name: data.name,
        description: data.description,
        variants: variantsWithUrls.map(variant => ({
          phoneModelId: variant.phoneModelId,
          price: variant.price,
          quantity: variant.quantity,
          imageUrl: 'imageUrl' in variant ? variant.imageUrl || variant.image : variant.image, // In case it's already a URL
          isActive: variant.isActive,
        })),
      };

      // Submit to API
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error('Failed to create product');

      toast.success("Product created successfully!");
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Phone Case</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Info */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Enter product name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...form.register("description")}
              placeholder="Enter product description"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Device Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Brand Selection */}
          <div>
            <Label>Brand</Label>
            <Select
              value={selectedBrand}
              onValueChange={(value) => setSelectedBrand(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Series Selection */}
          <div>
            <Label>Series</Label>
            <Select
              value={selectedSeries}
              onValueChange={(value) => setSelectedSeries(value)}
              disabled={!selectedBrand}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a series" />
              </SelectTrigger>
              <SelectContent>
                {series.map((serie) => (
                  <SelectItem key={serie.id} value={serie.id}>
                    {serie.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          <div>
            <Label>Models</Label>
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !selectedModels.includes(value)) {
                  setSelectedModels([...selectedModels, value]);
                }
              }}
              disabled={!selectedSeries}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select models" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected Models */}
        {selectedModels.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Selected Models</Label>
              <Button
                type="button"
                onClick={handleAddModels}
                disabled={selectedModels.length === 0}
              >
                Add to Variants
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedModels.map((modelId) => {
                const model = models.find(m => m.id === modelId);
                return (
                  <div
                    key={modelId}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2"
                  >
                    {model?.name}
                    <button
                      type="button"
                      onClick={() => setSelectedModels(selectedModels.filter(id => id !== modelId))}
                      className="text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Variants */}
        <div className="space-y-4">
          <Label>Variants</Label>
          {fields.length === 0 && (
            <p className="text-sm text-gray-500">No variants added yet. Select models above and click "Add to Variants".</p>
          )}

          {fields.map((field, index) => {
            const model = models.find(m => m.id === field.phoneModelId);
            return (
              <div key={field.id} className="border p-4 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <Label>Model</Label>
                  <p className="font-medium">{model?.name}</p>
                </div>

                <div>
                  <Label htmlFor={`variants.${index}.price`}>Price</Label>
                  <Input
                    id={`variants.${index}.price`}
                    type="number"
                    {...form.register(`variants.${index}.price`, { valueAsNumber: true })}
                  />
                  {form.formState.errors.variants?.[index]?.price && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.variants[index]?.price?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`variants.${index}.quantity`}>Stock</Label>
                  <Input
                    id={`variants.${index}.quantity`}
                    type="number"
                    {...form.register(`variants.${index}.quantity`, { valueAsNumber: true })}
                  />
                  {form.formState.errors.variants?.[index]?.quantity && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.variants[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor={`variants.${index}.image`}>Image</Label>
                    <Input
                      id={`variants.${index}.image`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          form.setValue(`variants.${index}.image`, e.target.files[0]);
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`variants.${index}.isActive`}
                      {...form.register(`variants.${index}.isActive`)}
                      defaultChecked
                    />
                    <Label htmlFor={`variants.${index}.isActive`}>Active</Label>
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      remove(index);
                      setSelectedModels(selectedModels.filter(id => id !== field.phoneModelId));
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Product"}
        </Button>
      </form>
    </div>
  );
}

// Types for TypeScript
type Brand = {
  id: string;
  name: string;
};

type Series = {
  id: string;
  name: string;
  brandId: string;
};

type PhoneModel = {
  id: string;
  name: string;
  seriesId: string;
};