'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  showValue?: boolean;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ value, onChange, min = 0, max = 10, step = 1, disabled = false, className, showValue = true }, ref) => {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed accent-primary"
        />
        {showValue && (
          <span className="min-w-[2rem] text-center text-sm font-medium text-foreground">
            {value}
          </span>
        )}
      </div>
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };
