import {Observable as $} from 'rx'

import {
  Teams,
} from 'components/remote'

export const TeamFetcher = sources => ({
  team$: sources.teamKey$
    .flatMapLatest(k => k ? Teams.query.one(sources)(k) : $.just(null)),
})
