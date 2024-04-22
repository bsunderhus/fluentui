import {
  SLOT_ELEMENT_TYPE_SYMBOL,
  SLOT_RENDER_FUNCTION_SYMBOL,
  type SlotComponentType,
  type SlotRenderFunction,
} from '@fluentui/react-utilities';
import * as React from 'react';

import type { PresenceComponentProps } from './factories/createPresenceComponent';

export type PresenceMotionSlot = {
  as?: React.FC<PresenceComponentProps>;
  children?: SlotRenderFunction<PresenceComponentProps>;
  onMotionFinish?: PresenceComponentProps['onMotionFinish'];
};

export function presenceMotionSlot(
  motion: PresenceMotionSlot | undefined,
  options: { component: React.FC<PresenceComponentProps> },
): SlotComponentType<PresenceComponentProps> {
  const { as, children, onMotionFinish } = motion || {};

  const Component = typeof as === 'undefined' ? options.component : as ?? React.Fragment;
  const propsWithMetadata = {
    onMotionFinish,
    [SLOT_ELEMENT_TYPE_SYMBOL]: Component,
  } as SlotComponentType<PresenceComponentProps>;

  if (typeof children === 'function') {
    propsWithMetadata[SLOT_RENDER_FUNCTION_SYMBOL] = children as SlotRenderFunction<PresenceComponentProps>;
  }

  return propsWithMetadata;
}
