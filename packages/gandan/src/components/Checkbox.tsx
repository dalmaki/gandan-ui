import React from "react";
import clsx from "../utils/clsx";
import "./Checkbox.css";

type CheckboxProps = Omit<React.ComponentPropsWithRef<'input'>, 'type'>;

export function Checkbox({
    className,
    ...props
}: CheckboxProps) {
    return <input type="checkbox" className={clsx('__C-checkbox', className)} {...props} />;
}