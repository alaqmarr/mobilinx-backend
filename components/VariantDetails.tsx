// components/VariantDetails.tsx
'use client';
import DragAndDropImageUpload from '@/components/DragAndDropImageUpload';
import { FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';

export default function VariantDetails({ form, index, model } : { form: any, index: number, model: any }) {
  return (
    <div className="border p-4 rounded-lg space-y-4">
      <h4 className="font-medium">{model?.name} Variant</h4>
      
      <FormField
        control={form.control}
        name={`variants.${index}.imageFile`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cover Image</FormLabel>
            <DragAndDropImageUpload
              onUpload={(file:any) => {
                form.setValue(`variants.${index}.imageFile`, file);
                return URL.createObjectURL(file);
              }}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`variants.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <Input
                type="number"
                {...field}
                onChange={e => field.onChange(Number(e.target.value))}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`variants.${index}.price`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <Input
                type="number"
                step="0.01"
                {...field}
                onChange={e => field.onChange(Number(e.target.value))}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}