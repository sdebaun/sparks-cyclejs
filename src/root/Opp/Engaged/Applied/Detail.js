import {Observable} from 'rx'
const {just, merge} = Observable
import {div} from 'helpers'

// import {log} from 'util'

import {
  BaseDialog,
  OkAndCancel,
} from 'components/sdm'

import {RoutedComponent} from 'components/ui'

import {
  Profiles,
  Engagements,
  Memberships,
  // Teams,
} from 'components/remote'

const Blank = () => ({
  DOM: just(div({},[])),
})

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

  // const engagement$ = just({})
  // const profile$ = just({})
  // const memberships$ = just({})

  return {
    profile$,
    engagement$,
    memberships$,
  }
}

const _Content = sources => {
  return {
    DOM: sources.engagementKey$.map(k => just(div({},['key', k]))),
  }
}

const ApprovalDialog = sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  const oac = OkAndCancel(_sources)
  const c = _Content(_sources)
  const d = BaseDialog({..._sources,
    titleDOM$: _sources.profile$.pluck('fullName'),
    isOpen$: just(true),
    contentDOM$: c.DOM,
    actionsDOM$: oac.DOM,
  })

  const route$ = _sources.oppKey$.map(k => `/opp/${k}/engaged/applied`)
    .sample(merge(oac.ok$, oac.cancel$))

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
