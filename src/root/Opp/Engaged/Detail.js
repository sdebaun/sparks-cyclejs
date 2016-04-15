import {Observable} from 'rx'
const {just, merge} = Observable

// import {log} from 'util'
import {combineDOMsToDiv} from 'util'

import {
  QuotingListItem,
  RoutedComponent,
  ActionButton,
  DescriptionListItem,
  TitleListItem,
} from 'components/ui'

import {
  ListItemCollapsible,
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

const _ProfileInfo = sources => ({
  DOM: combineDOMsToDiv('.row', _Avatar(sources), _Intro(sources)),
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

const _TeamItem = sources => {
  const team$ = sources.item$.pluck('teamKey')
    .flatMapLatest(Teams.query.one(sources))

  const li = ListItemCollapsible({...sources,
    title$: team$.pluck('name'),
    contentDOM$: _TeamQandA({...sources, team$}).DOM,
  })

  return li
}

const _TeamsInfo = sources => {
  const title = TitleListItem({...sources, title$: just('Applied to Teams')})
  const list = List({...sources,
    Control$: just(_TeamItem),
    rows$: sources.memberships$,
  })

  return {
    DOM: combineDOMsToDiv('', title, list),
  }
}

const _Priority = sources => ActionButton({...sources,
  label$: just('#1'),
  params$: just({isAccepted: true, priority: true, declined: false}),
})

const _Accept = sources => ActionButton({...sources,
  label$: just('OK'),
  params$: just({isAccepted: true, priority: false, declined: false}),
})

const _Decline = sources => ActionButton({...sources,
  label$: just('NO'),
  params$: just({isAccepted: false, priority: false, declined: true}),
})

const _Actions = (sources) => {
  const pr = _Priority(sources)
  const ac = _Accept(sources)
  const dec = _Decline(sources)

  return {
    DOM: combineDOMsToDiv('.center', pr, ac, dec),
    action$: merge(pr.action$, ac.action$, dec.action$),
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

const _Scrolled = sources => ({
  DOM: combineDOMsToDiv('.scrollable',
    _ProfileInfo(sources),
    _EngageInfo(sources),
    _TeamsInfo(sources),
  ),
})

const _Content = sources => {
  const acts = _Actions(sources)
  const scr = _Scrolled(sources)

  return {
    DOM: combineDOMsToDiv('', acts, scr),
    action$: acts.action$,
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
  )
  .combineLatest(
    _sources.oppKey$,
    _sources.engagements$,
    (r, key, engs) => switchRoute(r, key, engs)
  )

  const queue$ = c.action$
    .withLatestFrom(_sources.engagementKey$,
      (values, key) => ({key, values})
    )
    .map(Engagements.action.update)

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
