import React from "react";
import clsx from "../utils/clsx";
import "./Radio.css";

type RadioProps = Omit<React.ComponentPropsWithRef<'input'>, 'type'>;

export function Radio({
    className,
    ...props
}: RadioProps) {
    return <input type="radio" className={clsx('__C-radio', className)} {...props} />;
}