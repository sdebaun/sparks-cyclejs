import {Observable as $} from 'rx'
import moment from 'moment'
//import {div} from 'cycle-snabbdom'
import {combineDOMsToDiv} from 'util'

import {
  RaisedButton,
  List,
  ListItem,
  ListItemCollapsible,
  ListItemClickable,
  ListItemCheckbox,
} from 'components/sdm'

import {
  TeamImages,
  Shifts,
  Assignments,
} from 'components/remote'

import {h4} from 'cycle-snabbdom'

import {div, iconSrc, icon} from 'helpers'

// const ToggleControl = sources => {
//   const toggle$ = sources.DOM.select('.toggle').observable.map(e => e[0])
//     .filter(e => e && e.children)
//     .map(e => e.children[0].classList)
//     .map(e => Array.prototype.slice.call(e))
//     .map(e => e.indexOf('icon-toggle-on') !== -1 ? false : true)
//     .distinctUntilChanged()

//   const click$ = toggle$.sample(sources.DOM.select('.toggle').events('click'))
//     .shareReplay(1)

//   return {
//     // click$: $.never(),
//     // DOM: $.just(div('',['wat'])),
//     click$,
//     DOM: sources.value$.merge(click$).map(v =>
//       div({class: {toggle: true}},[
//         v ?
//         icon('toggle-on','accent') :
//         icon('toggle-off'),
//       ])
//     ),
//   }
// }

// const ListItemToggle = (sources) => {
//   const toggle = ToggleControl(sources)
//   const click$ = toggle.click$.shareReplay(1)

//   const titleValue$ = sources.value$ || click$

//   const item = ListItemClickable({...sources,
//     leftDOM$: toggle.DOM,
//     title$: titleValue$.flatMapLatest(v =>
//       v ? sources.titleTrue$ : sources.titleFalse$
//     ),
//   })

//   return {
//     DOM: item.DOM,
//     value$: click$.shareReplay(1),
//   }
// }

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
  const date$ = sources.item$.pluck('date')

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

  const li = ListItemCheckbox({
    ...sources,
    value$: assignmentKey$.map(k => k ? true : false).startWith(false),
    titleTrue$: sources.item$.withLatestFrom(reservations$, shiftView),
    titleFalse$: sources.item$.withLatestFrom(reservations$, shiftView),
  })

  const queue$ = li.value$
    .tap(x => console.log('new queue value', x))
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
    date$,
  }
}

const DaysListItem = sources => {
  const li = List({
    ...sources,
    rows$: sources.item$.pluck('shifts'),
    Control$: $.just(ShiftItem),
  })

  const lic = ListItemCollapsible({
    ...sources,
    isOpen$: $.just(false),
    title$: li.date$.map(d => h4({}, [
      moment(d).format('dddd, MM Do, YYYY'),
    ])),
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
    const $key = moment(keys[j]).format('YYYY-MM-DD')
    arr[j] = {$key, shifts: obj[keys[j]]}
  }
  return arr
}

import {TeamAvatar} from 'components/team'

const MembershipItem = (sources) => {
  const team$ = sources.item$.pluck('teamKey')
    .flatMapLatest(key => sources.firebase('Teams', key))

  const shifts$ = sources.item$.pluck('teamKey')
    .flatMapLatest(Shifts.query.byTeam(sources))

  const shiftsByDate$ = shifts$
    .map(groupByDate)

  const av = TeamAvatar({...sources,
    teamKey$: sources.item$.pluck('teamKey'),
  })

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
    leftDOM$: av.DOM,
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
        div({}, shift.date),
        dom,
      ])
    ),
  }
}

const Instructions = sources => ListItem({...sources,
  title$: sources.neededAssignments$
    .map(n => n === 0 ?
      `Perfect! Confirm your shifts and carry on.` :
      `You need to choose ${n} more shifts.`
    ),
})

const AssignmentList = sources => List({...sources,
  rows$: sources.assignments$,
  Control$: $.of(AssignmentShiftListItem),
})

const AssignmentBlock = sources => {
  const inst = Instructions(sources)
  const list = AssignmentList(sources)

  return {
    DOM: combineDOMsToDiv('', inst, list),
    queue$: list.queue$,
  }
}

const _Fetch = sources => {
  const assignments$ = sources.userProfileKey$
    .flatMapLatest(Assignments.query.byOwner(sources))

  const requiredAssignments$ = sources.commitments$
    .map(c => c.filter(x => x.code === 'shifts'))
    .map(a => a[0] && a[0].count || 0)

  const selectedAssignments$ = assignments$
    .map(c => c.length)

  const neededAssignments$ = $.combineLatest(
    requiredAssignments$, selectedAssignments$,
    (r,s) => r - s
  )

  return {
    assignments$,
    requiredAssignments$,
    selectedAssignments$,
    neededAssignments$,
  }
}

const ConfirmButton = sources => {
  const btn = RaisedButton({...sources,
    label$: $.of('Confirm your shifts now!'),
  })

  return {
    DOM: sources.neededAssignments$
      .flatMapLatest(n => n > 0 ? btn.DOM : $.just(div('',[]))),
  }
}

export default function(sources) {
  const _sources = {...sources, ..._Fetch(sources)}

  const ab = AssignmentBlock(_sources)
  const ml = MembershipList(_sources)
  const btn = ConfirmButton(_sources)

  return {
    queue$: $.merge(ab.queue$, ml.queue$),
    DOM: combineDOMsToDiv('', ab, btn, ml),
  }
}
