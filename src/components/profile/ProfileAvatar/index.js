// import {Observable as $} from 'rx'

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
