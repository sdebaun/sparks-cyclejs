import {Observable} from 'rx'
const {of} = Observable
import {ListItemWithDialog} from 'components/sdm'
import {Form} from 'components/ui/Form'
import {InputControl} from 'components/sdm'
import {ListItemClickable} from 'components/sdm'
import {Shifts} from 'components/remote'
import {div} from 'cycle-snabbdom'
import {icon} from 'helpers'

const StartsInput = sources => InputControl({...sources,
  label$: of('Starts At Hour (24 hour)'),
})

const HoursInput = sources => InputControl({...sources,
  label$: of('Hours'),
})

const PeopleInput = sources => InputControl({...sources,
  label$: of('People (Number)'),
})

const ToggleControl = sources => {
  const click$ = sources.DOM.select('.toggle').events('click')
    .map(true)
    .scan((a) => !a, false)
    .startWith(false)
    .shareReplay(1)

  return {
    click$,
    DOM: click$.map(v =>
      div({class: {toggle: true}},[
        v ?
        icon('toggle-on','accent') :
        icon('toggle-off'),
      ])
    ),
  }
}

const ListItemBonusToggle = (sources) => {
  const toggle = ToggleControl(sources)
  const item = ListItemClickable({...sources,
    leftDOM$: toggle.DOM,
    title$: toggle.click$.flatMapLatest(v =>
      v ? sources.titleTrue$ : sources.titleFalse$
    ),
  })

  return {
    DOM: item.DOM,
    value$: toggle.click$,
  }
}

const ToggleBonus = sources => ListItemBonusToggle({...sources,
  titleTrue$:
    of('Bonus'),
  titleFalse$:
    of('Normal'),
})

const ShiftForm = sources => Form({...sources,
  Controls$: of([
    {field: 'starts', Control: StartsInput},
    {field: 'hours', Control: HoursInput},
    {field: 'people', Control: PeopleInput},
    {field: 'bonus', Control: ToggleBonus},
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

  const submit$ = liwd.submit$
  const queue$ = form.item$
    .withLatestFrom(sources.teamKey$, (shift, teamKey) => ({teamKey, ...shift}))
    .sample(submit$)
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
