import {Observable as $} from 'rx'

import {
  Profiles,
} from 'components/remote'

export const ProfileFetcher = sources => ({
  profile$: sources.profileKey$
    .flatMapLatest(k => k ? Profiles.query.one(sources)(k) : $.just(null)),
})
