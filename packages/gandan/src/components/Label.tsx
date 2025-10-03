import React from "react";
import clsx from "../utils/clsx";
import { cva, VariantProps } from "../utils/cva";
import './Label.css';

type LabelProps = React.ComponentPropsWithRef<'label'> & VariantProps<typeof labelVariants>;

const labelVariants = cva(
    "__C-label",
    {
        variants: {
            t: {
                radio: "__T-radio",
                checkbox: "__T-checkbox",
                input: "__T-input",
                default: "",
            }
        },
        defaultVariants: {
            t: 'default',
        },
    }
)

export function Label({
    className,
    t,
    ...props
}: LabelProps) {
  return <label
    className={clsx(labelVariants({ t, className }))}
    {...props}
  />;
}