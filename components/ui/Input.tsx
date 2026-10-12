import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-foreground">{label}</label>}
        <input
          ref={ref}
          className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-light focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-200 focus-visible:border-red-500 focus-visible:ring-red-200' : ''
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
