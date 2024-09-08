import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {  format, isValid, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | number): string {
  // Handle the case where the input is already a timestamp
  const date = typeof input === 'string' ? parseISO(input) : new Date(input);

  if (!isValid(date)) {
    throw new Error('Invalid date input');
  }

  return format(date, 'MMM d, yyyy');
}

export function formatTickDate(input: string | number): string {
  // Handle the case where the input is already a timestamp
  const date = typeof input === 'string' ? parseISO(input) : new Date(input);

  if (!isValid(date)) {
    throw new Error('Invalid date input');
  }

  return format(date, 'd');
}

// export function formatTickDate(date: Date, interval: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'): string {
//   switch (interval) {
//     case '1D':
//       return format(date, 'MMM d');
//     case '1W':
//       return format(date, 'MMM d');
//     case '1M':
//       return format(date, 'MMM d');
//     case '3M':
//       return format(date, 'MMM');
//     case '1Y':
//       return format(date, 'MMM');
//     case 'ALL':
//       return format(date, 'MMM yyyy');
//     default:
//       return format(date, 'MMM d, yyyy');
//   }
// }

export function formatAmount(amount: number, currency: string, displayCurrency = true) {
  return new Intl.NumberFormat('en-US', {
    style: displayCurrency ? 'currency' : undefined,
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number) {
  // return new Intl.NumberFormat('en-US', {
  //   style: 'percent',
  //   maximumFractionDigits: 2,
  // }).format(value);

  return `${value.toFixed(2)}%`;
}

export function toPascalCase(input: string) {
  return input
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
