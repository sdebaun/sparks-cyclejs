import {Observable} from 'rx'
const {just, merge} = Observable
import {div} from 'helpers'

import {log} from 'util'

import {
  BaseDialog,
  OkAndCancel,
} from 'components/sdm'

import {RoutedComponent} from 'components/ui'

import {
  Profiles,
  Engagements,
  Memberships,
  Teams,
} from 'components/remote'

const Blank = () => ({
  DOM: just(div({},[])),
})

const _Fetch = sources => ({
  engagement$: sources.engagementKey$
    .flatMapLatest(Engagements.query.one(sources))
    .shareReplay(1),
  memberships$: sources.engagementKey$
    .flatMapLatest(Memberships.query.byEngagement(sources))
    .shareReplay(1),
})

const ApprovalDialog = sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  const oac = OkAndCancel(_sources)
  const d = BaseDialog({..._sources,
    iconName$: just('people'),
    isOpen$: just(true),
    contentDOM$: _sources.engagementKey$.map(k => just(div({},['key', k]))),
    actionsDOM$: oac.DOM,
  })

  const route$ = _sources.oppKey$.map(k => `/opp/${k}/engaged/applied`)
    .sample(merge(oac.ok$, oac.cancel$))

  route$.subscribe(log('route$'))

  return {
    ...d,
    route$,
  }
}

export default sources => RoutedComponent({...sources,
  routes$: just({
    '/show/:key': key =>
      _sources => ApprovalDialog({..._sources, engagementKey$: just(key)}),
    '*': Blank,
  }),
})
