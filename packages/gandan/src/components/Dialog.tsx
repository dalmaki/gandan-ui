import { useEffect, useRef, useState } from "react";
import clsx from "../utils/clsx";
import "./Dialog.css";

type DialogProps = React.ComponentPropsWithRef<'div'>;

export function Dialog({
    className,
    children,
    ...props
}: DialogProps) {
    return (<div className={clsx('__C-dialog', className)} {...props}>
        {children}
    </div>);
}