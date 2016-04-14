import {Observable} from 'rx'
const {of} = Observable
import {ListItemWithDialog} from 'components/sdm'
import {Form} from 'components/ui/Form'
import {InputControl} from 'components/sdm'
import {Shifts} from 'components/remote'

const StartsInput = sources => InputControl({...sources,
  label$: of('Starts At Hour (24 hour)'),
})

const HoursInput = sources => InputControl({...sources,
  label$: of('Hours'),
})

const PeopleInput = sources => InputControl({...sources,
  label$: of('People (Number)'),
})

const ShiftForm = sources => Form({...sources,
  Controls$: of([
    {field: 'starts', Control: StartsInput},
    {field: 'hours', Control: HoursInput},
    {field: 'people', Control: PeopleInput},
  ]),
})

const AddShift = sources => {
  const form = ShiftForm(sources)
  const liwd = ListItemWithDialog({
    ...sources,
    iconName$: of('calendar-check-o'),
    title$: of('Add a shift.'),
    dialogTitleDOM$: of('Add a shift'),
    dialogContentDOM$: form.DOM,
  })

  const queue$ = form.item$
    .sample(liwd.submit$)
    .zip(sources.teamKey$, (shift,teamKey) => ({teamKey, ...shift}))
    .map(Shifts.action.create)

  return {
    DOM: liwd.DOM,
    queue$,
  }
}

export default sources => {
  const ss = AddShift(sources)
  return {
    DOM: ss.DOM,
    queue$: ss.queue$,
  }
}
