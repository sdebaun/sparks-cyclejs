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
} from 'components/ui'

import {
  ListItem,
  BaseDialog,
  FlatButton,
  // RaisedButton,
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
  const nfo = DescriptionListItem({...sources,
    title$: sources.profile$.pluck('intro'),
    default$: just('No intro written.'),
      // .map(a => a || h('span.secondary',['No intro written.'])),
  })

  return {DOM: combineDOMsToDiv('', av, nfo)}
}

const _EngageInfo = sources => {
  const q = QuotingListItem({...sources,
    profileKey$: sources.project$.pluck('ownerProfileKey'),
    title$: sources.opp$.pluck('question'),
  })
  const ans = DescriptionListItem({...sources,
    title$: sources.engagement$.pluck('answer'),
    default$: just('This person did not answer'),
      // .map(a => a || h('span.secondary',['This person did not answer.'])),
  })

  return {DOM: combineDOMsToDiv('', q, ans)}
}

const Priority = sources => ActionButton({...sources,
  label$: just('Priority'),
  params$: just({isAccepted: true, priority: true, declined: false}),
})

const Accept = sources => ActionButton({...sources,
  label$: just('Accept'),
  params$: just({isAccepted: true, priority: false, declined: false}),
})

const Decline = sources => ActionButton({...sources,
  label$: just('Decline'),
  params$: just({isAccepted: false, priority: false, declined: true}),
})

const _Actions = (sources) => {
  const pr = Priority(sources)
  const ac = Accept(sources)
  const dec = Decline(sources)

  const close = FlatButton({
    ...sources,
    label$: just('Cancel'),
    classNames$: just(['accent']),
  })

  return {
    DOM: combineDOMsToDiv('.center', pr, ac, dec, close),
    action$: merge(pr.action$, ac.action$, dec.action$),
    cancel$: close.click$,
  }
}

const _Content = sources => ({
  DOM: combineDOMsToDiv('',
    _ProfileInfo(sources),
    _EngageInfo(sources),
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
