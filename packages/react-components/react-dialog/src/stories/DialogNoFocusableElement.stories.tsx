import * as React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogBody } from '@fluentui/react-dialog';
import { Button } from '@fluentui/react-components';

export const NoFocusableElement = () => {
  return (
    <>
      <Dialog>
        <DialogTrigger>
          <Button>Open modal dialog</Button>
        </DialogTrigger>
        <DialogContent aria-label="label">
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogBody>
            <p>⚠️A Dialog without focusable elements is not recommended!⚠️</p>
            <p>Escape key and overlay click still works to ensure this modal can be closed</p>
          </DialogBody>
        </DialogContent>
      </Dialog>
      <Dialog modalType="non-modal">
        <DialogTrigger>
          <Button>Open non-modal dialog</Button>
        </DialogTrigger>
        <DialogContent aria-label="label">
          <DialogTitle closeButton={null}>Dialog Title</DialogTitle>
          <DialogBody>
            <p>⚠️A Dialog without focusable elements is not recommended!⚠️</p>
            <p>Escape key still works to ensure this modal can be closed</p>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
};

NoFocusableElement.parameters = {
  docs: {
    description: {
      story: '',
    },
  },
};