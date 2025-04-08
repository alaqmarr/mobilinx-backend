import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPhoneModels(seriesId: string) {
  return [
    { id: '1', name: 'iPhone 12' },
    { id: '2', name: 'iPhone 12 Pro' },
    { id: '3', name: 'iPhone 12 Pro Max' },
    { id: '4', name: 'iPhone 12 Mini' },
  ];
}