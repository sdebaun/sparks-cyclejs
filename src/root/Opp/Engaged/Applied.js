import {Observable} from 'rx'
const {just} = Observable

import {
  List,
  ListItem,
} from 'components/sdm'

import {
  Profiles,
  Engagements,
} from 'components/remote'

const Item = sources => {
  const profile$ = sources.item$
    .pluck('profileKey')
    .flatMapLatest(Profiles.query.one(sources))
    .shareReplay(1)

  return ListItem({...sources,
    title$: profile$.pluck('fullName'),
  })
}

const AppList = sources => List({...sources,
  Control$: just(Item),
  rows$: sources.engagements$,
})

const Fetch = sources => ({
  engagements$: sources.oppKey$
    .flatMapLatest(Engagements.query.byOpp(sources)),
})

export default sources => {
  const _sources = {...sources, ...Fetch(sources)}

  // const inst = Instruct(_sources)
  const list = AppList(_sources)
  // const next = Next(_sources)

  // const items = [
    // inst,
    // next,
    // list,
  // ]

  // const DOM = combineLatest(
  //   _sources.memberships$.map(m => m.length > 0),
  //   ...items.map(i => i.DOM),
  //   (hasTeams, i, n, l) => div({},[
  //     hasTeams ? n : i,
  //     l,
  //   ])
  // )

  return {
    DOM: list.DOM,
    // queue$: list.queue$,
    // route$: next.route$,
  }
}
