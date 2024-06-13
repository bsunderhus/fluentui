import {
  SLOT_ELEMENT_TYPE_SYMBOL,
  SLOT_RENDER_FUNCTION_SYMBOL,
  type SlotComponentType,
  type SlotRenderFunction,
} from '@fluentui/react-utilities';
import * as React from 'react';

import type { PresenceComponentProps } from './factories/createPresenceComponent';
import type { MotionParam } from './types';

export type PresenceMotionSlotProps<MotionParams extends Record<string, MotionParam> = {}> = Pick<
  PresenceComponentProps,
  'appear' | 'unmountOnExit' | 'onMotionFinish' | 'onMotionStart'
> &
  MotionParams & {
    // FIXME: 'as' property is required by design on the slot API
    // but it does not support components, only intrinsic elements
    // motion slots do not support intrinsic elements, only custom components
    /**
     * @deprecated Do not use. Presence Motion Slots do not support intrinsic elements.
     *
     * If you want to override the animation, use the children render function instead.
     */
    as?: keyof JSX.IntrinsicElements;
    // TODO: remove once React v18 slot API is modified
    // ComponentProps is not properly adding render function as a possible value for children
    children?: SlotRenderFunction<
      Pick<PresenceComponentProps, 'appear' | 'unmountOnExit' | 'onMotionFinish' | 'onMotionStart'> & MotionParams
    >;
  };

export function presenceMotionSlot<Props extends PresenceMotionSlotProps>(
  motion: Props | null | undefined,
  options: { elementType: React.FC<PresenceComponentProps> },
): SlotComponentType<Props & Pick<PresenceComponentProps, 'visible'>> {
  // eslint-disable-next-line deprecation/deprecation
  const { as, children, onMotionFinish } = (motion || {}) as Props & { children?: unknown };

  // TODO: handle null
  const Component = typeof as === 'undefined' ? options.elementType : as ?? React.Fragment;
  const propsWithMetadata = {
    onMotionFinish,
    [SLOT_ELEMENT_TYPE_SYMBOL]: Component,
  } as SlotComponentType<Props & Pick<PresenceComponentProps, 'visible'>>;

  if (typeof children === 'function') {
    propsWithMetadata[SLOT_RENDER_FUNCTION_SYMBOL] = children as SlotRenderFunction<
      Props & Pick<PresenceComponentProps, 'visible'>
    >;
  }

  return propsWithMetadata;
}
