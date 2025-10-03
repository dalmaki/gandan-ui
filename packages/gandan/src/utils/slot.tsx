/*
package: npm.@radix-ui/react-slot, npm.@radix-ui/react-compose-refs
version: 1.2.3, 1.1.2-rc.8
update: 2025-09-28
*/
/*
  MIT License

  Copyright (c) 2022 WorkOS

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

import * as React from 'react';

type PossibleRef<T> = React.Ref<T> | undefined;

/**
 * Set a given ref to a given value
 * This utility takes care of different types of refs: callback refs and RefObject(s)
 */
function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === 'function') {
    return ref(value);
  } else if (ref !== null && ref !== undefined) {
    ref.current = value;
  }
}

/**
 * A utility to compose multiple refs together
 * Accepts callback refs and RefObject(s)
 */
function composeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup == 'function') {
        hasCleanup = true;
      }
      return cleanup;
    });

    // React <19 will log an error to the console if a callback ref returns a
    // value. We don't use ref cleanups internally so this will only happen if a
    // user's ref callback returns a value, which we only expect if they are
    // using the cleanup functionality added in React 19.
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup == 'function') {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}

/**
 * A custom hook that composes multiple refs
 * Accepts callback refs and RefObject(s)
 */
function useComposedRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback(composeRefs(...refs), refs);
}

/* -------------------------------------------------------------------------------------------------
 * Slot
 * -----------------------------------------------------------------------------------------------*/

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

/* @__NO_SIDE_EFFECTS__ */ export function createSlot(ownerName: string) {
  const SlotClone = createSlotClone(ownerName);
  const Slot = React.forwardRef<HTMLElement, SlotProps>((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    const childrenArray = React.Children.toArray(children);
    const slottable = childrenArray.find(isSlottable);

    if (slottable) {
      // the new element to render is the one passed as a child of `Slottable`
      const newElement = slottable.props.children;

      const newChildren = childrenArray.map((child) => {
        if (child === slottable) {
          // because the new element will be the one rendered, we are only interested
          // in grabbing its children (`newElement.props.children`)
          if (React.Children.count(newElement) > 1) return React.Children.only(null);
          return React.isValidElement(newElement)
            ? (newElement.props as { children: React.ReactNode }).children
            : null;
        } else {
          return child;
        }
      });

      return (
        <SlotClone {...slotProps} ref={forwardedRef}>
          {React.isValidElement(newElement)
            ? React.cloneElement(newElement, undefined, newChildren)
            : null}
        </SlotClone>
      );
    }

    return (
      <SlotClone {...slotProps} ref={forwardedRef}>
        {children}
      </SlotClone>
    );
  });

  Slot.displayName = `${ownerName}.Slot`;
  return Slot;
}

const Slot = createSlot('Slot');

/* -------------------------------------------------------------------------------------------------
 * SlotClone
 * -----------------------------------------------------------------------------------------------*/

interface SlotCloneProps {
  children: React.ReactNode;
}

/* @__NO_SIDE_EFFECTS__ */ function createSlotClone(ownerName: string) {
  const SlotClone = React.forwardRef<any, SlotCloneProps>((props, forwardedRef) => {
    const { children, ...slotProps } = props;

    if (React.isValidElement(children)) {
      const childrenRef = getElementRef(children);
      const props = mergeProps(slotProps, children.props as AnyProps);
      // do not pass ref to React.Fragment for React 19 compatibility
      if (children.type !== React.Fragment) {
        props.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
      }
      return React.cloneElement(children, props);
    }

    return React.Children.count(children) > 1 ? React.Children.only(null) : null;
  });

  SlotClone.displayName = `${ownerName}.SlotClone`;
  return SlotClone;
}

/* -------------------------------------------------------------------------------------------------
 * Slottable
 * -----------------------------------------------------------------------------------------------*/

const SLOTTABLE_IDENTIFIER = Symbol('radix.slottable');

interface SlottableProps {
  children: React.ReactNode;
}

interface SlottableComponent extends React.FC<SlottableProps> {
  __radixId: symbol;
}

/* @__NO_SIDE_EFFECTS__ */ export function createSlottable(ownerName: string) {
  const Slottable: SlottableComponent = ({ children }) => {
    return <>{children}</>;
  };
  Slottable.displayName = `${ownerName}.Slottable`;
  Slottable.__radixId = SLOTTABLE_IDENTIFIER;
  return Slottable;
}

const Slottable = createSlottable('Slottable');

/* ---------------------------------------------------------------------------------------------- */

type AnyProps = Record<string, any>;

function isSlottable(
  child: React.ReactNode
): child is React.ReactElement<SlottableProps, typeof Slottable> {
  return (
    React.isValidElement(child) &&
    typeof child.type === 'function' &&
    '__radixId' in child.type &&
    child.type.__radixId === SLOTTABLE_IDENTIFIER
  );
}

function mergeProps(slotProps: AnyProps, childProps: AnyProps) {
  // all child props should override
  const overrideProps = { ...childProps };

  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];

    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      // if the handler exists on both, we compose them
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args: unknown[]) => {
          const result = childPropValue(...args);
          slotPropValue(...args);
          return result;
        };
      }
      // but if it exists only on the slot, we use only this one
      else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    }
    // if it's `style`, we merge them
    else if (propName === 'style') {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === 'className') {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(' ');
    }
  }

  return { ...slotProps, ...overrideProps };
}

// Before React 19 accessing `element.props.ref` will throw a warning and suggest using `element.ref`
// After React 19 accessing `element.ref` does the opposite.
// https://github.com/facebook/react/pull/28348
//
// Access the ref using the method that doesn't yield a warning.
function getElementRef(element: React.ReactElement) {
  // React <=18 in DEV
  let getter = Object.getOwnPropertyDescriptor(element.props, 'ref')?.get;
  let mayWarn = getter && 'isReactWarning' in getter && getter.isReactWarning;
  if (mayWarn) {
    return (element as any).ref;
  }

  // React 19 in DEV
  getter = Object.getOwnPropertyDescriptor(element, 'ref')?.get;
  mayWarn = getter && 'isReactWarning' in getter && getter.isReactWarning;
  if (mayWarn) {
    return (element.props as { ref?: React.Ref<unknown> }).ref;
  }

  // Not DEV
  return (element.props as { ref?: React.Ref<unknown> }).ref || (element as any).ref;
}

export {
  Slot,
  Slottable,
  //
  Slot as Root,
};
export type { SlotProps };