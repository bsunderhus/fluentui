import * as React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogBody, DialogActions } from '@fluentui/react-dialog';
import { Button } from '@fluentui/react-components';

export const ChangeFocus = () => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (open && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [open]);
  return (
    <>
      <Dialog open={open} onOpenChange={(event, data) => setOpen(data.open)}>
        <DialogTrigger>
          <Button>Open dialog</Button>
        </DialogTrigger>
        <DialogContent aria-label="label">
          <DialogTitle>Dialog title</DialogTitle>
          <DialogBody>This dialog focus on the second button instead of the first</DialogBody>
          <DialogActions position="left">
            <Button appearance="outline">Third Action</Button>
          </DialogActions>
          <DialogActions position="right">
            <DialogTrigger>
              <Button ref={buttonRef} appearance="secondary">
                Close
              </Button>
            </DialogTrigger>
            <Button appearance="primary">Do Something</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

ChangeFocus.parameters = {
  docs: {
    description: {
      story: '',
    },
  },
};
