import * as React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogBody, DialogActions } from '@fluentui/react-dialog';
import { Button } from '@fluentui/react-components';
import story from './DialogAlert.md';

export const Alert = () => {
  return (
    <>
      <Dialog modalType="alert">
        <DialogTrigger>
          <Button>Open Alert dialog</Button>
        </DialogTrigger>
        <DialogContent aria-label="label">
          <DialogTitle>Alert dialog title</DialogTitle>
          <DialogBody>
            This dialog cannot be dismissed by clicking on the overlay nor by pressing Escape. Close button should be
            pressed to dismiss this Alert
          </DialogBody>
          <DialogActions>
            <DialogTrigger>
              <Button appearance="secondary">Close</Button>
            </DialogTrigger>
            <Button appearance="primary">Do Something</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

Alert.parameters = {
  docs: {
    description: {
      story,
    },
  },
};