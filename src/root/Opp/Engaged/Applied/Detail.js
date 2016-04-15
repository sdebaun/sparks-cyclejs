import {Observable} from 'rx'
const {just, merge} = Observable
import {div} from 'helpers'
import {h} from 'cycle-snabbdom'

// import {log} from 'util'
import {combineDOMsToDiv} from 'util'

import {
  QuotingListItem,
  RoutedComponent,
} from 'components/ui'

import {
  ListItem,
  BaseDialog,
  FlatButton,
} from 'components/sdm'

import {LargeProfileAvatar} from 'components/profile'

import {
  Profiles,
  Engagements,
  Memberships,
  // Teams,
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

const _ProfileInfo = sources => {
  const av = LargeProfileAvatar({...sources,
    profileKey$: sources.engagement$.pluck('profileKey'),
  })
  const nfo = ListItem({...sources,
    title$: sources.profile$.pluck('intro')
      .map(a => a || h('span.secondary',['No intro written.'])),
    classes$: just({description: true}),
  })

  return {
    DOM: combineDOMsToDiv('', av, nfo),
  }
}

const _EngageInfo = sources => {
  const q = QuotingListItem({...sources,
    profileKey$: sources.project$.pluck('ownerProfileKey'),
    title$: sources.opp$.pluck('question'),
  })
  const ans = ListItem({...sources,
    title$: sources.engagement$.pluck('answer')
      .map(a => a || h('span.secondary',['This person did not answer.'])),
    classes$: just({description: true}),
  })

  return {
    DOM: combineDOMsToDiv('', q, ans),
  }
}

export const _Actions = (sources) => {
  const priority = FlatButton({
    ...sources,
    label$: just('Priority'),
    classNames$: just(['green']),
  })
  const accept = FlatButton({
    ...sources,
    label$: just('Accept'),
    classNames$: just(['blue']),
  })
  const decline = FlatButton({
    ...sources,
    label$: just('Decline'),
    classNames$: just(['red']),
  })
  const close = FlatButton({
    ...sources,
    label$: just('Cancel'),
    classNames$: just(['accent']),
  })

  const value$ = merge(
    priority.click$.map(() => 'priority'),
    accept.click$.map(() => 'accept'),
    decline.click$.map(() => 'decline')
  ).shareReplay(1)

  return {
    DOM: combineDOMsToDiv('.center',priority, accept, decline, close),
    value$,
    ok$: value$,
    cancel$: close.click$.share(),
  }
}

const _Content = sources => {
  const pi = _ProfileInfo(sources)
  const ei = _EngageInfo(sources)

  return {
    DOM: combineDOMsToDiv('', pi, ei),
  }
}

const ApprovalDialog = sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  const ac = _Actions(_sources)
  const c = _Content(_sources)
  const d = BaseDialog({..._sources,
    titleDOM$: _sources.profile$.pluck('fullName')
      .map(fn => div('.center',[fn])),
    isOpen$: just(true),
    contentDOM$: c.DOM,
    actionsDOM$: ac.DOM,
  })

  const route$ = _sources.oppKey$.map(k => `/opp/${k}/engaged/applied`)
    .sample(merge(ac.ok$, ac.cancel$))

  return {
    ...d,
    route$,
  }
}

export default sources => RoutedComponent({...sources,
  routes$: just({
    '/show/:key': k => s => ApprovalDialog({...s, engagementKey$: just(k)}),
    '*': Blank,
  }),
})
