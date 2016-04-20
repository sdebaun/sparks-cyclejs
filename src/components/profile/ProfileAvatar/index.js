import {Observable as $} from 'rx'

import {
  Avatar,
  MediumAvatar,
  LargeAvatar,
} from 'components/sdm'

import {
  Profiles,
} from 'components/remote'

// hmmm???
const ProfileFetcher = sources => ({
  profile$: sources.profileKey$
    .flatMapLatest(k => k ? Profiles.query.one(sources)(k) : $.just(null)),
})

const PortraitFetcher = sources => ({
  portraitUrl$: ProfileFetcher(sources).profile$
    .map(p => p ? p.portraitUrl : null),
})

const ProfileAvatar = sources => Avatar({...sources,
  src$: PortraitFetcher(sources).portraitUrl$,
})

const MediumProfileAvatar = sources => MediumAvatar({...sources,
  src$: PortraitFetcher(sources).portraitUrl$,
})

const LargeProfileAvatar = sources => LargeAvatar({...sources,
  src$: PortraitFetcher(sources).portraitUrl$,
})

export {
  ProfileAvatar,
  MediumProfileAvatar,
  LargeProfileAvatar,
}
