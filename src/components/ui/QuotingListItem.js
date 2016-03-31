import {Observable} from 'rx'
const {just, combineLatest} = Observable

import {
  Profiles,
} from 'components/remote'

import {
  ListItem,
} from 'components/sdm'

import {ProfileAvatar} from 'components/profile'

import {div} from 'helpers'

const QuotingListItem = sources => {
  const fromProfile$ = sources.profileKey$
    .flatMapLatest(Profiles.query.one(sources))

  const src$ = fromProfile$.pluck('portraitUrl')

  const li = ListItem({...sources,
    classes$: just({quote: true}),
  }) // uses title$
  const liq = ListItem({...sources,
    leftDOM$: ProfileAvatar({...sources, src$}).DOM,
    title$: fromProfile$.pluck('fullName'),
    subtitle$: just('Organizer'),
  })

  const DOM = combineLatest(
    li.DOM,
    liq.DOM,
    (...doms) => div({},doms)
  )

  return {
    DOM,
  }
}

export {QuotingListItem}
