// components/PhoneModelSelector.tsx
'use client';
import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { getPhoneModels } from '@/utils/phoneModels'; // Adjust the import path as necessary
import VariantDetails from './VariantDetails';

export default function PhoneModelSelector({ form }: { form: any }) {
  const seriesId = form.watch('seriesId');
  const variants = form.watch('variants');

  const phoneModels = useMemo(() => getPhoneModels(seriesId), [seriesId]);

  const handleModelToggle = (modelId: string) => {
    const currentVariants = [...variants];
    const index = currentVariants.findIndex(v => v.phoneModelId === modelId);

    if (index === -1) {
      currentVariants.push({
        phoneModelId: modelId,
        imageFile: null,
        quantity: 0,
        price: 0
      });
    } else {
      currentVariants.splice(index, 1);
    }
    
    form.setValue('variants', currentVariants);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Select Phone Models</h3>
      <div className="grid grid-cols-2 gap-4">
        {phoneModels.map((model:any) => (
          <div key={model.id} className="flex items-center space-x-2">
            <Checkbox
              checked={variants.some((v:any) => v.phoneModelId === model.id)}
              onCheckedChange={() => handleModelToggle(model.id)}
            />
            <label className="text-sm">{model.name}</label>
          </div>
        ))}
      </div>

      {/* Variant Details */}
      {variants.map((variant:any, index:any) => (
        <VariantDetails
          key={variant.phoneModelId}
          form={form}
          index={index}
          model={phoneModels.find((m:any) => m.id === variant.phoneModelId)}
        />
      ))}
    </div>
  );
}