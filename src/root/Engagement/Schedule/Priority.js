import {Observable as $} from 'rx'
import moment from 'moment'
//import {div} from 'cycle-snabbdom'

import {
  List,
  ListItemCollapsible,
  ListItemClickable,
} from 'components/sdm'

import {
  TeamImages,
} from 'components/remote'

import {h4} from 'cycle-snabbdom'

import {div, iconSrc, icon} from 'helpers'

const shifts$ = $.just([
  {$key: '1', date: '2016-04-14', shifts: [
    {
      bonus: false,
      hours: 6,
      reserved: 0,
      people: 4,
      starts: 10,
    },
    {
      bonus: false,
      hours: 6,
      reserved: 2,
      people: 5,
      starts: 12,
    },
    {
      bonus: true,
      hours: 4,
      reserved: 6,
      people: 6,
      starts: 14,
    },
    {
      bonus: false,
      hours: 5,
      reserved: 2,
      people: 8,
      starts: 24,
    },
  ]},
  {$key: '2', date: '2016-04-15', shifts: [
    {
      bonus: false,
      hours: 6,
      reserved: 4,
      people: 4,
      starts: 10,
    },
    {
      bonus: false,
      hours: 6,
      reserved: 1,
      people: 5,
      starts: 12,
    },
    {
      bonus: true,
      hours: 4,
      reserved: 5,
      people: 6,
      starts: 14,
    },
  ]},
])

const ToggleControl = sources => {
  sources.item$.subscribe(x => console.log('', x))
  const click$ = sources.DOM.select('.toggle').events('click')
    .map(true)
    .scan((a) => !a, false)
    .startWith(false)
    .withLatestFrom(sources.item$,
      (bool, {reserved, people}) => reserved === people ? false : bool
    )
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

const ListItemToggle = (sources) => {
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

const ShiftItem = sources =>
  ListItemToggle({
    ...sources,
    value$: $.just(false),
    titleTrue$: sources.item$.map(shiftView),
    titleFalse$: sources.item$.map(shiftView),
  })

const filterShifts = shifts =>
  shifts.filter(({reserved, people}) => reserved !== people)

const DaysListItem = sources => {
  const date$ = sources.item$.pluck('date')

  return ListItemCollapsible({
    ...sources,
    date$,
    isOpen$: $.just(false),
    title$: date$.map(d => moment(d).format('dddd, Do MMMM YYYY'))
      .map(d => h4({}, [d])),
    contentDOM$: List({
      ...sources,
      rows$: sources.item$.pluck('shifts').map(filterShifts),
      Control$: $.just(ShiftItem),
    }).DOM,
  })
}

const MembershipItem = (sources) => {
  const team$ = sources.item$.pluck('teamKey')
    .flatMapLatest(key => sources.firebase('Teams', key))

  /*
  const shifts$ = sources.item$.pluck('teamKey')
    .flatMapLatest(Shifts.query.byTeam(sources)) // when ready
  */

  const teamImage$ = sources.item$.pluck('teamKey')
    .flatMapLatest(TeamImages.query.one(sources))
    .pluck('dataUrl')

  const li = List({
    ...sources,
    shifts$,
    rows$: shifts$,
    Control$: $.just(DaysListItem),
  })

  return ListItemCollapsible({
    ...sources,
    isOpen$: $.just(false),
    title$: team$.pluck('name'),
    leftDOM$: teamImage$.map(iconSrc),
    contentDOM$: li.DOM,
  })
}

const MembershipList = sources =>
  List({
    ...sources,
    rows$: sources.memberships$,
    Control$: $.of(MembershipItem),
  })

export function Priority(sources) {
  sources.memberships$.subscribe(x => console.log('member', x))

  return {
    DOM: MembershipList(sources).DOM,
  }
}
