import {Observable as $} from 'rx'
import moment from 'moment'
//import {div} from 'cycle-snabbdom'
import {combineDOMsToDiv} from 'util'

import {
  RaisedButton,
  List,
  ListItem,
  ListItemCollapsible,
  ListItemCheckbox,
} from 'components/sdm'

import {
  Shifts,
  Assignments,
} from 'components/remote'

import {div, icon} from 'helpers'

import {
  ShiftContent,
} from 'components/shift'

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
  const content = ShiftContent(sources)
  const shiftKey$ = sources.item$.pluck('$key')

  const assignment$ = sources.assignments$
    .withLatestFrom(shiftKey$,
      (assignments, shiftKey) => {
        return assignments.filter(a => a.shiftKey === shiftKey)
      }
    )
    .map(a => a.length > 0 && a[0] || null)

  const li = ListItemCheckbox({...sources,
    ...content,
    value$: assignment$,
  })

  const queue$ = li.value$
    .tap(x => console.log('new queue value', x))
    .withLatestFrom(sources.item$, assignment$,
      (val, {$key: shiftKey, teamKey}, assignment) => {
        if (!assignment) {
          return Assignments.action.create({teamKey, shiftKey})
        }
        return assignment.$key && Assignments.action.remove(assignment.$key)
      }
    )
    .shareReplay(1)

  return {
    DOM: li.DOM,
    // DOM: $.just(div('',['wat'])),
    queue$,
  }
}

const DaysListItem = sources => {
  const list = List({
    ...sources,
    rows$: sources.item$.pluck('shifts'),
    Control$: $.just(ShiftItem),
  })

  const lic = ListItemCollapsible({
    ...sources,
    isOpen$: $.just(false),
    title$: sources.item$.pluck('date')
      .map(d => moment(d).format('dddd, MMMM Do')),
    contentDOM$: list.DOM,
  })

  return {
    DOM: lic.DOM,
    queue$: list.queue$,
  }
}

import {TeamAvatar} from 'components/team'

const DatesBuilder = sources => {
  const groupDateRows = (acc,next) => {
    if (acc[next.date]) {
      acc[next.date].shifts.push(next)
    } else {
      acc[next.date] = {
        $key: moment(next.date).format('YYYY-MM-DD'),
        date: next.date,
        shifts: [next],
      }
    }
    return acc
  }

  return {
    rows$: sources.rows$
      .map(r => r.reduce(groupDateRows, {}))
      .map(o => Object.keys(o).map(k => ({$key: k, ...o[k]}))),
  }
}

const _FetchMembershipInfo = sources => {
  const team$ = sources.item$.pluck('teamKey')
    .flatMapLatest(key => sources.firebase('Teams', key))

  const shifts$ = sources.item$.pluck('teamKey')
    .flatMapLatest(Shifts.query.byTeam(sources))

  const dates$ = DatesBuilder({...sources, rows$: shifts$}).rows$

  return {
    team$,
    shifts$,
    dates$,
  }
}

const MembershipItem = (sources) => {
  const _sources = {...sources, ..._FetchMembershipInfo(sources)}

  const av = TeamAvatar({..._sources,
    teamKey$: _sources.item$.pluck('teamKey'),
  })

  const li = List({..._sources,
    rows$: _sources.dates$,
    Control$: $.just(DaysListItem),
  })

  const lic = ListItemCollapsible({..._sources,
    isOpen$: $.just(false),
    title$: _sources.team$.pluck('name'),
    leftDOM$: av.DOM,
    contentDOM$: li.DOM,
  })

  return {
    DOM: lic.DOM,
    queue$: li.queue$,
  }
}

const MembershipList = sources =>
  List({...sources,
    rows$: sources.memberships$,
    Control$: $.of(MembershipItem),
  })

const AssignmentShiftListItem = sources => {
  const _sources = {...sources,
    shift$: sources.item$.pluck('shiftKey')
    .tap(x => console.log('shiftKey', x))
    .flatMapLatest(Shifts.query.one(sources))
    .tap(x => console.log('shift', x))
    ,
  }

  const content = ShiftContent({..._sources,
    item$: _sources.shift$,
  })

  // const li = ListItem({..._sources,
  //   ...content,
  // })
  const li = ListItemCheckbox({..._sources,
    ...content,
    value$: $.just(true),
  })

  const queue$ = li.value$
    .tap(x => console.log('new queue value', x))
    .withLatestFrom(
      sources.item$,
      (val,{$key}) => Assignments.action.remove($key)
    )
    .shareReplay(1)

  return {
    DOM: li.DOM,
    queue$,
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
  // Control$: $.of(ShiftItem),
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
    .flatMapLatest(Assignments.query.byProfile(sources))

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
      .flatMapLatest(n => n === 0 ? btn.DOM : $.just(div('',[]))),
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
