import {
  Avatar,
  MediumAvatar,
  LargeAvatar,
} from 'components/sdm'

import {
  TeamImages,
} from 'components/remote'

const sparkly = require('images/pitch/sparklerHeader-2048.jpg')

const TeamImageFetcher = sources => ({
  teamImage$: sources.teamKey$
    .flatMapLatest(TeamImages.query.one(sources)),
})

const Fetcher = sources => ({
  dataUrl$: TeamImageFetcher(sources).teamImage$
    .map(p => p && p.dataUrl || `/${sparkly}`),
})

const TeamAvatar = sources => Avatar({...sources,
  src$: Fetcher(sources).dataUrl$,
})

const MediumTeamAvatar = sources => MediumAvatar({...sources,
  src$: Fetcher(sources).dataUrl$,
})

const LargeTeamAvatar = sources => LargeAvatar({...sources,
  src$: Fetcher(sources).dataUrl$,
})

export {
  TeamAvatar,
  MediumTeamAvatar,
  LargeTeamAvatar,
}
