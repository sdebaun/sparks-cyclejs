import {Observable as $} from 'rx'
//import {div} from 'cycle-snabbdom'

import {
  List,
  ListItemCollapsible,
  ListItemClickable,
} from 'components/sdm'

import {
  TeamImages,
} from 'components/remote'

import {div, iconSrc, icon} from 'helpers'

const shifts$ = $.just([
  {$key: '1', date: '2016-04-14', shifts: [
    {
      bonus: false,
      hours: 6,
      people: 4,
      starts: 10,
    },
    {
      bonus: false,
      hours: 6,
      people: 5,
      starts: 12,
    },
    {
      bonus: true,
      hours: 4,
      people: 6,
      statrt: 14,
    },
  ]},
  {$key: '2', date: '2016-04-15', shifts: [
    {
      bonus: false,
      hours: 6,
      people: 4,
      starts: 10,
    },
    {
      bonus: false,
      hours: 6,
      people: 5,
      starts: 12,
    },
    {
      bonus: true,
      hours: 4,
      people: 6,
      statrt: 14,
    },
  ]},
])

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

const ShiftItem = sources =>
  ListItemToggle({
    ...sources,
    value$: $.just(false),
    titleTrue$: $.just('Shift selected'),
    titleFalse$: $.just('Select this shift'),
  })

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
    rows$: shifts$,
    Control$: $.just(ShiftItem),
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
