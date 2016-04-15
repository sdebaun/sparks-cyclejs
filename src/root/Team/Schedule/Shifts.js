import {Observable} from 'rx'
const {of} = Observable
import {ListItemWithDialog} from 'components/sdm'
import {Form} from 'components/ui/Form'
import {InputControl} from 'components/sdm'
import {ListItemClickable} from 'components/sdm'
import {Shifts as ShiftsRemote} from 'components/remote'
import {div} from 'cycle-snabbdom'
import {icon} from 'helpers'
import {combineLatestToDiv} from 'util'

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
    .withLatestFrom(
      sources.teamKey$,
      sources.date$,
      (shift, teamKey, date) => ({
        teamKey,
        date,
        ...shift,
      }))
    .sample(submit$)
    .map(ShiftsRemote.action.create)

  return {
    DOM: liwd.DOM,
    queue$,
  }
}

function convertHours(hours) {
  const _hours = parseInt(hours)
  if (_hours === 24) {
    return `12 AM`
  }
  if (_hours === 12) {
    return `12 PM`
  }
  if (_hours > 24) {
    return convertHours(hours - 24)
  }
  return _hours > 12 ?
    `${_hours - 12} PM` :
    `${_hours} AM`
}

function getEndTime(starts, hours) {
  return convertHours(parseInt(starts) + parseInt(hours))
}

const sharedStyle = {
  flexGrow: '1',
  textAlign: 'center',
}

function shiftView({hours, starts, reserved, people}) {
  return div({style: {display: 'flex', flexDirection: 'row'}}, [
    div({style: sharedStyle}, [convertHours(starts)]),
    div({style: sharedStyle}, [getEndTime(starts, hours)]),
    div({style: sharedStyle}, [`${reserved} / ${people}`, icon('people')]),
  ])
}

const Shifts = sources => {
  const shifts$ = sources.teamKey$
    .flatMapLatest(ShiftsRemote.query.byTeam(sources))
  const shiftsForDate$ = shifts$
    .combineLatest(sources.date$, (shifts, date) => {
      return shifts.filter(shift => shift.date === date)
    })
  const DOM = shiftsForDate$
    .map(shifts => div(shifts.map(shiftView)))
  return {DOM}
}

export default sources => {
  const s = Shifts(sources)
  const as = AddShift(sources)
  return {
    DOM: combineLatestToDiv(s.DOM, as.DOM),
    queue$: as.queue$,
  }
}
