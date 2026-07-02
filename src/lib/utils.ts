import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


const CER_PALETTE = [
  { bg: '#F0EEE9', color: '#595650', border: '#DDD9D3' },
  { bg: '#FEF5E4', color: '#92600A', border: '#F5D89A' },
  { bg: '#EEF5F1', color: '#2A5C41', border: '#B8D9C8' },
  { bg: '#F0EEF8', color: '#5A4A8A', border: '#C8C0E0' },
];

export const cerStyle = (index: number) => CER_PALETTE[index % CER_PALETTE.length];

export const PENDING_STYLE = { bg: '#F0EEE9', color: '#9B9890', label: 'Pending' }

export const statusStyle = (status: string) => {
    switch (status) {
        case 'paid':
            return { bg: '#EEF5F1', color: '#2A5C41', label: 'Fully paid' };
        case 'partial':
            return  { bg: '#FDF5E6', color: '#92600A', label: 'Deposit paid' };
        case 'unpaid':
            return { bg: '#FDF0F0', color: '#A83030', label: 'Unpaid' };
        case 'pending':
            return PENDING_STYLE;
        default:
            return { bg: '#F0EEE9', color: '#595650', label: 'Unknown' };
    }
}

export const progressColor = (p: number) => {
  if (p >= 100) return '#3A7A5A'
  if (p >= 70)  return '#B87820'
  if (p >= 50)  return '#D4891A'
  if (p > 0)    return '#C43C3C'
  return '#E0DDD6'
}

export const badgeStyle = (badge: string) => {
  switch (badge) {
    case 'missing_info':   return { bg: '#FDF5E6', color: '#92600A', label: 'Missing info' }
    case 'no_vendor':      return { bg: '#FDF0F0', color: '#A83030', label: 'No vendor' }
    case 'pending_refund': return { bg: '#FDF5E6', color: '#92600A', label: 'Pending refund' }
    case 'unpaid':         return { bg: '#FDF0F0', color: '#A83030', label: 'Unpaid' }
    case 'balance_due':    return { bg: '#FDF0F0', color: '#A83030', label: 'Balance due' }
    case 'unconfirmed':    return { bg: '#F0EEE9', color: '#595650', label: 'Unconfirmed' }
    default:               return { bg: '#F0EEE9', color: '#595650', label: badge }
  }
}