import {Observable} from 'rx'
const {just, merge} = Observable
// import {div} from 'helpers'
import {h} from 'cycle-snabbdom'

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
  // RaisedButton,
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

const Priority = sources => ActionButton({...sources,
  label$: just('#1'),
  params$: just({isAccepted: true, priority: true, declined: false}),
})

const Accept = sources => ActionButton({...sources,
  label$: just('OK'),
  params$: just({isAccepted: true, priority: false, declined: false}),
})

const Decline = sources => ActionButton({...sources,
  label$: just('NO'),
  params$: just({isAccepted: false, priority: false, declined: true}),
})

const _Actions = (sources) => {
  const pr = Priority(sources)
  const ac = Accept(sources)
  const dec = Decline(sources)

  const close = FlatButton({...sources, label$: just('X')})

  return {
    DOM: combineDOMsToDiv('.center', pr, ac, dec, close),
    action$: merge(pr.action$, ac.action$, dec.action$),
    cancel$: close.click$,
  }
}

const _Content = sources => ({
  DOM: combineDOMsToDiv('.scrollable',
    _ProfileInfo(sources),
    _EngageInfo(sources),
    _TeamsInfo(sources),
  ),
})

const ApprovalDialog = sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  const ac = _Actions(_sources)
  const c = _Content(_sources)
  const d = BaseDialog({..._sources,
    titleDOM$: _sources.profile$.pluck('fullName'),
    isOpen$: just(true),
    contentDOM$: c.DOM,
    actionsDOM$: ac.DOM,
  })

  const route$ = _sources.oppKey$.map(k => `/opp/${k}/engaged/applied`)
    .sample(merge(ac.action$, ac.cancel$))

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
