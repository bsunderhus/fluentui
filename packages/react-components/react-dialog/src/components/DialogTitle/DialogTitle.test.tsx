import * as React from 'react';
import { render } from '@testing-library/react';
import { DialogTitle } from './DialogTitle';
import { isConformant } from '../../common/isConformant';
import type { DialogTitleProps } from './DialogTitle.types';

describe('DialogTitle', () => {
  isConformant<DialogTitleProps>({
    Component: DialogTitle,
    displayName: 'DialogTitle',
  });

  // TODO add more tests here, and create visual regression tests in /apps/vr-tests

  it('renders a default state', () => {
    const result = render(<DialogTitle>Default DialogTitle</DialogTitle>);
    expect(result.container).toMatchSnapshot();
  });
});
