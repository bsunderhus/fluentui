import * as React from 'react';
import { getNativeElementProps, useEventCallback, useMergedRefs } from '@fluentui/react-utilities';
import type { DialogContentProps, DialogContentState } from './DialogContent.types';
import { useDialogContext_unstable } from '../../contexts/dialogContext';
import { useModalAttributes } from '@fluentui/react-tabster';
import { isEscapeKeyDismiss } from '../../utils/isEscapeKeyDown';

/**
 * Create the state required to render DialogContent.
 *
 * The returned state can be modified with hooks such as useDialogContentStyles_unstable,
 * before being passed to renderDialogContent_unstable.
 *
 * @param props - props from this instance of DialogContent
 * @param ref - reference to root HTMLElement of DialogContent
 */
export const useDialogContent_unstable = (
  props: DialogContentProps,
  ref: React.Ref<HTMLElement>,
): DialogContentState => {
  const modalType = useDialogContext_unstable(ctx => ctx.modalType);
  const { as = 'div', trapFocus = modalType !== 'non-modal' } = props;

  const contentRef = useDialogContext_unstable(ctx => ctx.contentRef);
  const requestOpenChange = useDialogContext_unstable(ctx => ctx.requestOpenChange);

  const { modalAttributes } = useModalAttributes({ trapFocus });

  const handleRootKeyDown = useEventCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    props.onKeyDown?.(event);
    if (isEscapeKeyDismiss(event, modalType)) {
      requestOpenChange({ event, open: false, type: 'escapeKeyDown' });
      event.preventDefault();
    }
  });

  return {
    components: {
      root: 'div',
    },
    root: getNativeElementProps(as, {
      ref: useMergedRefs(ref, contentRef),
      ...props,
      ...modalAttributes,
      onKeyDown: handleRootKeyDown,
    }),
  };
};