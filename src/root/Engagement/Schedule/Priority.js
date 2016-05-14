import {Observable as $} from 'rx'
import moment from 'moment'
//import {div} from 'cycle-snabbdom'
import {combineDOMsToDiv} from 'util'
import isolate from '@cycle/isolate'

import {
  RaisedButton,
  List,
  ListItem,
  ListItemCollapsible,
  ListItemCheckbox,
  ListItemClickable,
  CheckboxControl,
} from 'components/sdm'

import {
  DescriptionListItem,
} from 'components/ui'

import {
  Shifts,
  Assignments,
  Engagements,
} from 'components/remote'

import {div} from 'helpers'

import {
  ShiftContent,
} from 'components/shift'

const ListItemCheckboxDisabling = sources => {
  const cbox = CheckboxControl(sources)

  const item = ListItemClickable({...sources,
    rightDOM$: $.combineLatest(
      sources.isDisabled$ || $.just(false),
      sources.disabledDOM || $.just(''),
      cbox.DOM,
      (isDisabled, d, cb) => isDisabled ? d : cb
    ),
    title$: sources.value$.flatMapLatest(v =>
      sources.title$ ||
      (v ? sources.titleTrue$ : sources.titleFalse$)
    ),
    classes$: sources.isDisabled$
      .map(isDisabled => ({disabled: isDisabled, clickable: !isDisabled})),
  })

  const value$ = item.click$
    .withLatestFrom(sources.value$)
    .map(x => !x)

  return {
    DOM: item.DOM,
    value$,
  }
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
    .shareReplay(1)

  const isDisabled$ = sources.item$
    .map(({people,assigned}) => parseInt(assigned,10) >= parseInt(people,10))

  const li = ListItemCheckboxDisabling({...sources,
    ...content,
    value$: assignment$,
    isDisabled$,
    disabledDOM: $.just(div('.disabled',['FULL'])),
  })

  sources.engagement$.subscribe(x => console.log('engagement$',x))

  const value$ = li.value$
    .combineLatest(isDisabled$)
    .filter(([val,isDisabled]) => !isDisabled) // eslint-disable-line

  const queue$ = value$
    .tap(x => console.log('new queue value', x))
    .withLatestFrom(
      sources.item$, assignment$, sources.engagement$,
      sources.engagementKey$, sources.engagement$.pluck('profileKey'),
      (val, {$key: shiftKey, teamKey}, assignment, {oppKey}, engagementKey, profileKey) => { // eslint-disable-line
        if (!assignment) {
          return Assignments.action.create({teamKey, shiftKey, oppKey, engagementKey, profileKey}) // eslint-disable-line
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

// const xAssignedShiftItem = sources => {
//   const shift$ = sources.item$.pluck('shiftKey')
//     .flatMapLatest(Shifts.query.one(sources))
//     .tap(x => console.log('ASI shift$', x))
//     .shareReplay(1)

//   return ShiftItem({...sources,
//     item$: shift$,
//   })
// }

const AssignedShiftItem = sources => {
  const _sources = {...sources,
    shift$: sources.item$.pluck('shiftKey')
    // .tap(x => console.log('shiftKey', x))
    .flatMapLatest(Shifts.query.one(sources))
    // .tap(x => console.log('shift', x))
    ,
  }

  const content = ShiftContent({..._sources,
    item$: _sources.shift$,
  })

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

const ShiftFilter = sources => ({
  rows$: $.combineLatest(
    sources.item$,
    sources.shifts$,
    (item, shifts) =>
      shifts
        .filter(s => s.date === item.date)
        .sort((a,b) => moment(a.start) - moment(b.start))
  ),
})

import {localTime} from 'util'

const DaysListItem = sources => {
  const list = List({
    ...sources,
    // rows$: sources.item$.pluck('shifts'),
    rows$: ShiftFilter(sources).rows$,
    Control$: $.just(ShiftItem),
  })

  const lic = ListItemCollapsible({
    ...sources,
    isOpen$: $.just(false),
    title$: sources.item$.pluck('date')
      .map(d => localTime(d).format('dddd, MMMM Do')),
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
      .map(o => Object.keys(o).map(k => ({$key: k, ...o[k]})))
      .distinctUntilChanged(i => i.length),
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

const isAccepted = m => m.isAccepted

const MembershipList = sources => List({...sources,
  rows$: sources.memberships$.map(x => x && x.filter(isAccepted)),
  Control$: $.of(MembershipItem),
})

const AssignmentInstructions = sources => DescriptionListItem({...sources,
  title$: sources.neededAssignments$
    .map(n => n === 0 ?
      `Perfect! Confirm your shift preferences and carry on.` :
      `Pick which shifts you prefer to work. ` +
        `You need to choose ${n} more shifts.  ` +
        `You will be notified if the organizers need to reschedule you.`
    ),
})

const AssignmentList = sources => List({...sources,
  rows$: sources.assignments$,
  Control$: $.of(AssignedShiftItem),
  // Control$: $.of(ShiftItem),
})

const AssignmentBlock = sources => {
  const inst = AssignmentInstructions(sources)
  const list = AssignmentList(sources)

  return {
    DOM: combineDOMsToDiv('', inst, list).distinctUntilChanged(),
    queue$: list.queue$,
  }
}

const SelectionInstructions = sources => ListItem({...sources,
  title$: $.of('Choose shifts from the teams below.'),
})

const SelectionBlock = sources => {
  const inst = SelectionInstructions(sources)
  const list = MembershipList(sources)

  return {
    DOM: sources.neededAssignments$
      .map(n => n > 0).distinctUntilChanged()
      .flatMapLatest(needed => needed ?
        combineDOMsToDiv('',inst,list) :
        $.just(div('',[]))
      ),
    queue$: list.queue$,
  }
}

const _Fetch = sources => {
  const assignments$ = sources.engagement$.pluck('profileKey')
    .flatMapLatest(Assignments.query.byProfile(sources))
    .combineLatest(sources.engagementKey$)
    .tap(x => console.log('wat',x))
    .map(
      ([c, engagementKey]) => c.filter(a => a.engagementKey === engagementKey)
    )

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
  const btn = isolate(RaisedButton)({...sources,
    label$: $.of('Confirm your shifts now!'),
  })

  const queue$ = btn.click$
    .withLatestFrom(
      sources.engagementKey$,
      (click, key) => ({key, values: {isAssigned: true}})
    )
    .map(Engagements.action.update)

  return {
    DOM: sources.neededAssignments$
      .flatMapLatest(n => n === 0 ? btn.DOM : $.just(div('',[]))),
    queue$,
  }
}

export default function(sources) {
  const _sources = {...sources, ..._Fetch(sources)}

  const ab = AssignmentBlock(_sources)
  const sb = SelectionBlock(_sources)
  const btn = ConfirmButton(_sources)

  return {
    queue$: $.merge(ab.queue$, sb.queue$, btn.queue$),
    DOM: combineDOMsToDiv('', ab, btn, sb),
  }
}
