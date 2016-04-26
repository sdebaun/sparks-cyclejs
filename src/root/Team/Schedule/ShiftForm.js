import {Observable as $} from 'rx'

import {
  ListItemCheckbox,
  InputControl,
} from 'components/sdm'

import {Form} from 'components/ui/Form'

const StartsInput = sources => InputControl({...sources,
  label$: $.of('Starts At Hour (24 hour)'),
})

const HoursInput = sources => InputControl({...sources,
  label$: $.of('Hours'),
})

const PeopleInput = sources => InputControl({...sources,
  label$: $.of('People (Number)'),
})

// const ToggleBonus = sources => ListItemCheckbox({...sources,
//   titleTrue$: $.of('Bonus'),
//   titleFalse$: $.of('Normal'),
// })

export const ShiftForm = sources => Form({...sources,
  Controls$: $.of([
    {field: 'start', Control: StartsInput},
    {field: 'hours', Control: HoursInput},
    {field: 'people', Control: PeopleInput},
    // {field: 'bonus', Control: ToggleBonus},
  ]),
})
