import {
  SLOT_ELEMENT_TYPE_SYMBOL,
  SLOT_RENDER_FUNCTION_SYMBOL,
  type SlotComponentType,
  type SlotRenderFunction,
} from '@fluentui/react-utilities';
import * as React from 'react';

import type { PresenceComponentProps } from './factories/createPresenceComponent';
import type { MotionParam } from './types';

// TODO: fix {} type
export type PresenceMotionSlotProps<MotionParams extends Record<string, MotionParam> = {}> = Pick<
  PresenceComponentProps,
  'appear' | 'imperativeRef' | 'unmountOnExit' | 'onMotionFinish' | 'onMotionStart'
> & {
  // TODO: fix me
  as?: any;
  // TODO: fix me
  children?: any;
} & MotionParams;

export function presenceMotionSlot<Props extends PresenceMotionSlotProps<Record<string, MotionParam>>>(
  motion: Props | null | undefined,
  options: { elementType: React.FC<PresenceComponentProps> },
): SlotComponentType<Props & Pick<PresenceComponentProps, 'visible'>> {
  const { as, children, onMotionFinish } = motion || {};

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
