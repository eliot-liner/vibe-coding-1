import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';

type ToggleButtonProps = ComponentPropsWithoutRef<'button'>;

export const ToggleButton = ({ className, children, ...props }: ToggleButtonProps) => (
  <button className={cn('mt-4 rounded border-2 px-4 py-1 font-bold shadow hover:scale-105', className)} {...props}>
    {children}
  </button>
);
