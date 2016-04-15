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
  Shifts,
} from 'components/remote'

import {h4} from 'cycle-snabbdom'

import {div, iconSrc, icon} from 'helpers'

const ToggleControl = sources => {
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
  const click$ = toggle.click$.shareReplay(1)
  const item = ListItemClickable({...sources,
    leftDOM$: toggle.DOM,
    title$: click$.flatMapLatest(v =>
      v ? sources.titleTrue$ : sources.titleFalse$
    ),
  })

  return {
    DOM: item.DOM,
    value$: click$.shareReplay(1),
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

function handleReserved(value, {$key: key, reserved, people}) {
  if (value && value + 1 <= people) {
    return {key, values: {reserved: reserved + 1}}
  }
  if (!value && reserved > 0) {
    return {key, values: {reserved: reserved - 1}}
  }
  return null
}

const ShiftItem = sources => {
  const li = ListItemToggle({
    ...sources,
    value$: $.just(false),
    titleTrue$: sources.item$.map(shiftView),
    titleFalse$: sources.item$.map(shiftView),
  })

  const queue$ = li.value$.skip(1)
    .withLatestFrom(sources.item$, handleReserved)
    .filter(x => x !== null)
    .map(Shifts.action.update)
    .shareReplay(1)

  return {
    DOM: li.DOM,
    queue$,
  }
}

const filterShifts = shifts =>
  shifts.filter(({reserved, people}) => reserved !== people)

const DaysListItem = sources => {
  const date$ = sources.item$.pluck('date')
  const li = List({
    ...sources,
    rows$: sources.item$.pluck('shifts').map(filterShifts),
    Control$: $.just(ShiftItem),
  })

  const lic = ListItemCollapsible({
    ...sources,
    date$,
    isOpen$: $.just(false),
    title$: date$.map(d => moment(d).format('dddd, Do MMMM YYYY'))
      .map(d => h4({}, [d])),
    contentDOM$: li.DOM,
  })

  return {
    DOM: lic.DOM,
    queue$: li.queue$,
  }
}

function groupByDate(arrayOfShifts) {
  const obj = {}
  for (let i = 0; i < arrayOfShifts.length; ++i) {
    const date = arrayOfShifts[i].date
    if (!Array.isArray(obj[date])) {
      obj[date] = [arrayOfShifts[i]]
    } else {
      obj[date].push(arrayOfShifts[i])
    }
  }
  const keys = Object.keys(obj)
  const arr = Array(keys.length)

  for (let j = 0; j < keys.length; ++j) {
    arr[j] = {$key: keys[j], shifts: obj[keys[j]]}
  }
  return arr
}

const MembershipItem = (sources) => {
  const team$ = sources.item$.pluck('teamKey')
    .flatMapLatest(key => sources.firebase('Teams', key))

  const shifts$ = sources.item$.pluck('teamKey')
    .flatMapLatest(Shifts.query.byTeam(sources))

  const shiftsByDate$ = shifts$
    .map(groupByDate)

  const teamImage$ = sources.item$.pluck('teamKey')
    .flatMapLatest(TeamImages.query.one(sources))
    .pluck('dataUrl')

  const li = List({
    ...sources,
    shifts$,
    rows$: shiftsByDate$,
    Control$: $.just(DaysListItem),
  })

  const lic = ListItemCollapsible({
    ...sources,
    isOpen$: $.just(false),
    title$: team$.pluck('name'),
    leftDOM$: teamImage$.map(iconSrc),
    contentDOM$: li.DOM,
  })

  return {
    DOM: lic.DOM,
    queue$: li.queue$,
  }
}

const MembershipList = sources =>
  List({
    ...sources,
    rows$: sources.memberships$,
    Control$: $.of(MembershipItem),
  })

export function Priority(sources) {
  return MembershipList(sources)
}
