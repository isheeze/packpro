import {Button, Popover, FormLayout, TextField} from '@shopify/polaris';
import {useState, useCallback} from 'react';

export default function QuantityPopover({formState, setFormState}) {
  const [popoverActive, setPopoverActive] = useState(false);
  const [originalQuantity] = useState(formState.quantity);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const activator = (
    <Button onClick={togglePopoverActive} disclosure fullWidth textAlign="start">
        {formState.quantity}
    </Button>
  );

  return (
    <div>
      <Popover
        active={popoverActive}
        activator={activator}
        onClose={togglePopoverActive}
        ariaHaspopup={false}
        sectioned
      >
        <FormLayout>
            <TextField
                label="Adjust By"
                type="number"
                value={formState.adjustedVal}
                onChange={(newVal)=> {setFormState({ ...formState, adjustedVal:newVal, quantity:Number(Number(originalQuantity) + Number(newVal))})}}
                autoComplete="off"
            />
          <TextField
            label="Note"
            value={formState.adjustedNote}
            onChange={(newVal)=> (setFormState({ ...formState, adjustedNote:newVal}))}
            autoComplete="off"
            helpText="Small note (i.e. new stock)."
          />
        </FormLayout>
      </Popover>
    </div>
  );
}