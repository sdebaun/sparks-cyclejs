import {Observable} from 'rx'
const {of, combineLatest} = Observable
import {Form} from 'components/ui/Form'
import {Shifts as ShiftsRemote} from 'components/remote'
import {div} from 'cycle-snabbdom'
import {icon} from 'helpers'
import {combineLatestToDiv} from 'util'

import moment from 'moment'

import {
  List,
  ListItemWithMenu,
  ListItemClickable,
  ListItemWithDialog,
  InputControl,
} from 'components/sdm'

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
    {field: 'start', Control: StartsInput},
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
      ({start, hours, people, bonus}, teamKey, date) => ({
        teamKey,
        date: moment(date).format(),
        reserved: 0,
        hours,
        people,
        bonus,
        start: moment(date).add(start,'hours').format(),
        end: moment(date).add(start,'hours').add(hours,'hours').format(),
      }))
    .sample(submit$)
    .map(ShiftsRemote.action.create)

  return {
    DOM: liwd.DOM,
    queue$,
  }
}

const _Fetch = sources => {
  const shifts$ = sources.teamKey$
    .flatMapLatest(ShiftsRemote.query.byTeam(sources))
  const shiftsForDate$ = shifts$
    .combineLatest(sources.date$, (shifts, date) =>
      shifts.filter(shift => shift.date === moment(date).format())
        .sort((a,b) => moment(a.start).valueOf() - moment(b.start).valueOf())
    )
  return {shifts$, shiftsForDate$}
}

const todIcons = [0,1,2,3,4,5,6]
  .map(i => '/' + require(`images/daytimeicon_${i}.png`))

const daySegment = hr => Math.floor((parseInt(hr) + 2) / 4)

const row = (style, ...els) => div({style: {display: 'flex', ...style}}, els)
const cell = (style, ...els) => div({style: {flex: '1', ...style}}, els)

const timeCell = t =>
  cell({minWidth: '90px', textAlign: 'left'}, moment(t).format('h:mm a'))

const _Item = sources => ListItemWithMenu({...sources,
  iconSrc$: sources.item$.pluck('start')
    .map(start => todIcons[daySegment(moment(start).hours())]),
  title$: combineLatest(
    sources.item$.pluck('start'),
    sources.item$.pluck('end'),
    sources.item$.pluck('people'),
    (s,e,p) => row({},
      timeCell(s), timeCell(e),
      cell({flex: '100', textAlign: 'right'},`0 / ${p} `,icon('people')),
    )
  ),
  subtitle$: sources.item$.pluck('hours').map(h => `${h} hours`),
  rightDOM$: of(icon('menu')),
})

const _List = sources => List({...sources,
  Control$: of(_Item),
  rows$: sources.shiftsForDate$,
})

export default sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  const list = _List(_sources)
  const add = AddShift(_sources)
  return {
    DOM: combineLatestToDiv(list.DOM, add.DOM),
    queue$: add.queue$,
  }
}
