// components/BrandSeriesSelector.tsx
'use client';
import { useEffect } from 'react';

type Series = {
    id: string;
    name: string;
};
type Brand = {
    id: string;
    name: string;
};
import { Controller } from 'react-hook-form';
import { getBrands, getSeries } from '@/actions/product-actions';
import { FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export default function BrandSeriesSelector({ form }: { form: any }) {
    const brandId = form.watch('brandId');

    useEffect(() => {
        form.setValue('seriesId', '');
    }, [brandId]);

    return (
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <Controller
                            control={form.control}
                            name="brandId"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getBrands().map((brand: Brand) => (
                                            <SelectItem key={brand.id} value={brand.id}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="seriesId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Series</FormLabel>
                        <Controller
                            control={form.control}
                            name="seriesId"
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={!brandId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select series" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getSeries(brandId).map((series: Series) => (
                                            <SelectItem key={series.id} value={series.id}>
                                                {series.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}