import React from 'react';
import { cva, VariantProps } from '../utils/cva';
import './Input.css';

const inputVariants = cva(
    "__C-input",
    {
        variants: {
            s: {
                sm: "__S-sm",
                md: "__S-md",
                lg: "__S-lg",
            }
        },
        defaultVariants: {
            s: 'md',
        },
    }
);

export function Input({
    className,
    s,
    ...props
}: React.ComponentPropsWithRef<'input'> & VariantProps<typeof inputVariants>) {
  return <input
    className={inputVariants({ s, className })}
    {...props}
  />;
}