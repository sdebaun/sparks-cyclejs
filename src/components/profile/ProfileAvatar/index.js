import {
  Avatar,
  MediumAvatar,
  LargeAvatar,
} from 'components/sdm'

import {ProfileFetcher} from 'components/profile/ProfileFetcher'

const PortraitFetcher = sources => ({
  portraitUrl$: ProfileFetcher(sources).profile$
    .map(p => p ? p.portraitUrl : null),
})

export const ProfileAvatar = sources => Avatar({...sources,
  src$: PortraitFetcher(sources).portraitUrl$,
})

export const MediumProfileAvatar = sources => MediumAvatar({...sources,
  src$: PortraitFetcher(sources).portraitUrl$,
})

export const LargeProfileAvatar = sources => LargeAvatar({...sources,
  src$: PortraitFetcher(sources).portraitUrl$,
})
