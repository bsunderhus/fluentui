import { makeStyles, mergeClasses } from '@griffel/react';
import type { DialogBodySlots, DialogBodyState } from './DialogBody.types';
import type { SlotClassNames } from '@fluentui/react-utilities';
import { typographyStyles } from '@fluentui/react-theme';
import * as localShorthands from '../../utils/localShorthands';

export const dialogBodyClassName = 'fui-DialogBody';
export const dialogBodyClassNames: SlotClassNames<DialogBodySlots> = {
  root: 'fui-DialogBody',
};

/**
 * Styles for the root slot
 */
const useStyles = makeStyles({
  root: {
    width: '100%',
    height: 'fit-content',
    minHeight: '32px',
    boxSizing: 'border-box',
    ...localShorthands.gridArea('body'),
    ...typographyStyles.body1,
  },
});

/**
 * Apply styling to the DialogBody slots based on the state
 */
export const useDialogBodyStyles_unstable = (state: DialogBodyState): DialogBodyState => {
  const styles = useStyles();
  state.root.className = mergeClasses(dialogBodyClassName, styles.root, state.root.className);

  // TODO Add class names to slots, for example:
  // state.mySlot.className = mergeClasses(styles.mySlot, state.mySlot.className);

  return state;
};