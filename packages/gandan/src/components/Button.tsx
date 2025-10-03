import React from 'react';
import { Slot } from '../utils/slot';
import { clsx } from '../utils/clsx';
import { cva, VariantProps } from '../utils/cva';
import "./Button.css"

export const buttonVariants = cva(
  "__C-button",
  {
    variants: {
      v: {
        pri: "__V-pri",
        sec: "__V-sec",
        inv: "__V-inv",
      },
      s: {
        sm: "__S-sm",
        md: "__S-md",
        lg: "__S-lg",
      }
    },
    defaultVariants: {
      v: 'pri',
      s: 'md',
    },
  }
)

export function Button({
  className,
  asChild = false,
  s,
  v,
  ...props
}: React.ComponentPropsWithRef<'button'>
  & VariantProps<typeof buttonVariants>
  & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={clsx(buttonVariants({ v, s, className }))}
      {...props}
    />
  );
}