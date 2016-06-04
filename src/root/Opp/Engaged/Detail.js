import {Observable} from 'rx'
const {just, merge} = Observable

// import {log} from 'util'
import {combineDOMsToDiv} from 'util'
import {div, p} from 'cycle-snabbdom'

import {
  QuotingListItem,
  RoutedComponent,
  ActionButton,
  DescriptionListItem,
  TitleListItem,
} from 'components/ui'

import {
  ListItemCollapsible,
  ListItemNewTarget,
  BaseDialog,
  FlatButton,
  List,
} from 'components/sdm'

import {LargeProfileAvatar} from 'components/profile'

import {
  Profiles,
  Engagements,
  Memberships,
  Teams,
} from 'components/remote'

import {hideable} from 'util'

const Blank = () => ({DOM: just('')})

const _Fetch = sources => {
  const engagement$ = sources.engagementKey$
    .flatMapLatest(Engagements.query.one(sources))
    .shareReplay(1)
  const profile$ = engagement$.pluck('profileKey')
    .flatMapLatest(Profiles.query.one(sources))
    .shareReplay(1)
  const memberships$ = sources.engagementKey$
    .flatMapLatest(Memberships.query.byEngagement(sources))
    .shareReplay(1)

  return {
    profile$,
    engagement$,
    memberships$,
  }
}

const _Avatar = sources => LargeProfileAvatar({...sources,
  profileKey$: sources.engagement$.pluck('profileKey'),
})

const _Intro = sources => DescriptionListItem({...sources,
  title$: sources.profile$.pluck('intro'),
  default$: just('No intro written.'),
})

const _PersonalInfo = sources => {
  const view = ({email, phone}) =>
    div({}, [
      div('.row', {}, [
        p('#email', 'Email: ' + email),
      ]),
      div('.row', {}, [
        p('#phone', 'Phone number: ' + phone),
      ]),
    ])
  return {
    DOM: sources.profile$.map(view),
  }
}

const _ProfileInfo = sources => ({
  DOM: just(div([
    combineDOMsToDiv('.row',
      _Avatar(sources),
      _Intro(sources)
    ),
    combineDOMsToDiv('row', _PersonalInfo(sources)),
  ])),
})

const _ViewEngagement = sources => ListItemNewTarget({
  iconName$: just('link'),
  title$: just('See their Engagement Page'),
  url$: sources.engagement$.pluck('$key')
    .map(k => `/engaged/${k}`),
})

const _OppQ = sources => QuotingListItem({...sources,
  profileKey$: sources.project$.pluck('ownerProfileKey'),
  title$: sources.opp$.pluck('question'),
})

const _OppAnswer = sources => DescriptionListItem({...sources,
  title$: sources.engagement$.pluck('answer'),
  default$: just('This person did not answer'),
})

const _EngageInfo = sources => ({
  DOM: combineDOMsToDiv('', _OppQ(sources), _OppAnswer(sources)),
})

const _TeamQ = sources => QuotingListItem({...sources,
  profileKey$: sources.project$.pluck('ownerProfileKey'),
  title$: sources.team$.pluck('question'),
})

const _TeamAnswer = sources => DescriptionListItem({...sources,
  title$: sources.item$.pluck('answer'),
  default$: just('This person did not answer'),
})

const _TeamQandA = sources => ({
  DOM: combineDOMsToDiv('', _TeamQ(sources), _TeamAnswer(sources)),
})

const getTeamTitle = ({isAccepted = false, isDeclined = false}, {name}) => {
  if (isAccepted === true) { return `${name} - Accepted` }
  return isDeclined ? `${name} - Declined` : `${name}`
}

const _TeamItem = sources => {
  const team$ = sources.item$.pluck('teamKey')
    .flatMapLatest(Teams.query.one(sources))

  const title$ = sources.item$.combineLatest(team$, getTeamTitle)

  const qa = _TeamQandA({...sources, team$})

  const okButton = ActionButton({...sources,
    label$: just('Ok'),
    params$: just({isAccepted: true, isDeclined: false}),
  })

  const neverButton = ActionButton({...sources,
    label$: just('Never'),
    params$: just({isAccepted: false, isDeclined: true}),
    classNames$: just(['red']),
  })

  const queue$ = merge(okButton.action$, neverButton.action$)
    .withLatestFrom(sources.item$, (action, item) => ({
      key: item.$key,
      values: action,
    }))
    .map(Memberships.action.update)

  const contentDOM$ = combineDOMsToDiv('', qa, okButton, neverButton)

  const li = ListItemCollapsible({...sources, title$, contentDOM$})
  return {...li, queue$: merge(li.queue$, queue$)}
}

const _TeamsInfo = sources => {
  const title = TitleListItem({...sources, title$: just('Applied to Teams')})
  const list = List({...sources,
    Control$: just(_TeamItem),
    rows$: sources.memberships$,
  })

  const hasBeenAccepted$ = sources.memberships$
    .map(memberships => memberships.some(x => x.isAccepted === true))

  return {
    DOM: combineDOMsToDiv('', title, list),
    queue$: list.queue$,
    hasBeenAccepted$,
  }
}

const _Accept = sources => ActionButton({...sources,
  label$: just('OK'),
  params$: just({isAccepted: true, priority: false, declined: false}),
})

const _Decline = sources => ActionButton({...sources,
  label$: just('never'),
  params$: just({isAccepted: false, priority: false, declined: true}),
  classNames$: just(['red']),
})

const _Remove = sources => hideable(ActionButton)({...sources,
  label$: just('Delete'),
  params$: just({isAccepted: false, priority: false, declined: true}),
  classNames$: just(['black']),
  isVisible$: sources.userProfile$.pluck('isAdmin'),
})

const _Actions = (sources) => {
  const ac = _Accept(sources)
  const dec = _Decline(sources)
  const rem = _Remove(sources)

  return {
    DOM: combineDOMsToDiv('.center', ac, dec, rem),
    action$: merge(ac.action$, dec.action$),
    remove$: rem.action$,
  }
}

const _Navs = sources => {
  const prev = FlatButton({...sources, label$: just('<')})
  const close = FlatButton({...sources, label$: just('CLOSE')})
  const next = FlatButton({...sources, label$: just('>')})

  const route$ = merge(
    sources.engagementKey$.map(k => [k, -1])
      .sample(prev.click$),
    sources.engagementKey$.map(k => [k, 0])
      .sample(close.click$),
    sources.engagementKey$.map(k => [k, 1])
      .sample(next.click$),
  )

  return {
    DOM: combineDOMsToDiv('.center', prev, close, next),
    route$,
  }
}

const _Scrolled = sources => {
  const teamInfo = _TeamsInfo(sources)
  return {
    DOM: combineDOMsToDiv('.scrollable',
      _ProfileInfo(sources),
      _ViewEngagement(sources),
      _EngageInfo(sources),
      teamInfo,
    ),
    queue$: teamInfo.queue$,
    hasBeenAccepted$: teamInfo.hasBeenAccepted$,
  }
}

const _Content = sources => {
  const acts = _Actions(sources)
  const scr = _Scrolled(sources)

  const action$ = acts.action$.withLatestFrom(scr.hasBeenAccepted$,
    (action, hasBeenAccepted) => hasBeenAccepted || action.declined ?
      action : false
  ).filter(Boolean)

  return {
    DOM: combineDOMsToDiv('', acts, scr),
    remove$: acts.remove$,
    queue$: scr.queue$,
    action$,
  }
}

const switchRoute = ([eKey, relative], oppKey, engs) => {
  if (relative === 0 || engs.length <= 1) {
    return ``
  }
  let idx = engs.findIndex(e => e.$key === eKey) + relative
  console.log('looking for', idx, engs.length)
  if (idx < 0) { idx = engs.length - 1 }
  if (idx >= engs.length) { idx = 0 }
  console.log('changed to', idx)
  const newKey = engs[idx].$key
  return `/show/${newKey}`
}

const ApprovalDialog = sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  const navs = _Navs(_sources)
  const c = _Content(_sources)
  const d = BaseDialog({..._sources,
    titleDOM$: _sources.profile$.pluck('fullName'),
    isOpen$: just(true),
    contentDOM$: c.DOM,
    actionsDOM$: navs.DOM,
  })

  const route$ = merge(
    navs.route$,
    _sources.engagementKey$.map(k => [k, 1]).sample(c.action$),
    _sources.engagementKey$.map(k => [k, 1]).sample(c.remove$),
  )
  .combineLatest(
    _sources.oppKey$,
    _sources.engagements$,
    (r, key, engs) => switchRoute(r, key, engs)
  )

  const action$ = c.action$
    .withLatestFrom(_sources.engagementKey$,
      (values, key) => ({key, values})
    )
    .map(Engagements.action.update)

  const remove$ = c.remove$
    .withLatestFrom(_sources.engagementKey$,
      (values, key) => key
    )
    .map(Engagements.action.remove)

  const queue$ = merge(action$, remove$, c.queue$)

  return {
    ...d,
    route$,
    queue$,
  }
}

const Detail = sources => RoutedComponent({...sources,
  routes$: just({
    '/show/:key': k => s => ApprovalDialog({...s, engagementKey$: just(k)}),
    '*': Blank,
  }),
})

export {Detail}
