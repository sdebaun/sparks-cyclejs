import {Observable as $} from 'rx'
import moment from 'moment'
//import {div} from 'cycle-snabbdom'

import {
  List,
  ListItemCollapsible,
  ListItemClickable,
} from 'components/sdm'

import {
  Teams,
  TeamImages,
  Shifts,
  Assignments,
} from 'components/remote'

import {h4} from 'cycle-snabbdom'

import {div, iconSrc, icon} from 'helpers'

const ToggleControl = sources => {
  const click$ = sources.DOM.select('.toggle').events('click')
    .map(true)
    .scan((a) => !a, false)
    //.startWith(false)
    .shareReplay(1)

  return {
    click$,
    DOM: sources.value$.merge(click$).map(v =>
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

  const titleValue$ = sources.value$ || click$

  const item = ListItemClickable({...sources,
    leftDOM$: toggle.DOM,
    title$: titleValue$.flatMapLatest(v =>
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

function shiftView({hours, starts, people}, reserved) {
  return div({style: {display: 'flex', flexDirection: 'row'}}, [
    div({style: sharedStyle}, [convertHours(starts)]),
    div({style: sharedStyle}, [getEndTime(starts, hours)]),
    div({style: sharedStyle}, [`${reserved} / ${people}`, icon('people')]),
  ])
}

const ShiftItem = sources => {
  const shiftKey$ = sources.item$.pluck('$key')

  const reservations$ = shiftKey$
    .flatMapLatest(Assignments.query.byShift(sources))
    .map(a => a.length)
    .shareReplay(1)
    .startWith(0)

//  reservations$.subscribe(x => console.log('', x))

  const assignment$ = sources.assignments$
    .withLatestFrom(shiftKey$,
      (assignments, shiftKey) => {
        return assignments.filter(a => a.shiftKey === shiftKey)
      }
    )
    .map(a => a[0])
    .filter(Boolean)
    .shareReplay(1)

  const assignmentKey$ = assignment$.pluck('$key')
    .startWith(null)
    .shareReplay(1)

  const li = ListItemToggle({
    ...sources,
    value$: assignmentKey$.map(k => k ? true : false),
    titleTrue$: sources.item$.combineLatest(reservations$, shiftView),
    titleFalse$: sources.item$.combineLatest(reservations$, shiftView),
  })

  const queue$ = li.value$
    .withLatestFrom(sources.item$, assignmentKey$,
      (val, {$key: shiftKey, teamKey}, assignmentKey) => {
        if (val) {
          return Assignments.action.create({teamKey, shiftKey})
        }
        return assignmentKey && Assignments.action.remove(assignmentKey)
      }
    )
    .shareReplay(1)

  return {
    DOM: li.DOM,
    assignment$,
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
    assignment$: li.assignment$,
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
    team$,
    rows$: shiftsByDate$,
    Control$: $.just(DaysListItem),
  })

  const lic = ListItemCollapsible({
    ...sources,
    team$,
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

const AssignmentShiftListItem = sources => {
  const shift$ = sources.item$.pluck('shiftKey')
    .flatMapLatest(Shifts.query.one(sources))

  const reservations$ = sources.item$.pluck('shiftKey')
    .flatMapLatest(Assignments.query.byShift(sources))
    .map(a => a.length)
    .shareReplay(1)
    .startWith(0)

  return {
    DOM: shift$.combineLatest(reservations$, shiftView)
      .withLatestFrom(shift$, (dom, shift) =>
      div({}, [
        div({}, [moment(shift.date).format('dddd, Do MMMM YYYY')]),
        dom,
      ])
    ),
  }
}

const AssignmentList = sources =>
  List({
    ...sources,
    rows$: sources.assignments$,
    Control$: $.of(AssignmentShiftListItem),
  })

export function Priority(sources) {
  const assignments$ = sources.userProfileKey$
    .flatMapLatest(Assignments.query.byOwner(sources))

  const al = AssignmentList({...sources, assignments$})
  const ml = MembershipList({...sources, assignments$})

  return {
    ...ml,
    DOM: al.DOM.combineLatest(ml.DOM, (alDOM, mlDOM) =>
      div({}, [
        div({}, [
          h4({}, 'Shifts you have reserved'),
          alDOM,
        ]),
        div({}, [
          h4({}, 'Other shifts available'),
          mlDOM,
        ]),
      ])),
  }
}
