import {
  Avatar,
} from 'components/sdm'

import {
  ProjectImages,
} from 'components/remote'

const sparkly = require('images/pitch/sparklerHeader-2048.jpg')

const ProjectImageFetcher = sources => ({
  projectImage$: sources.projectKey$
    .flatMapLatest(ProjectImages.query.one(sources)),
})

const Fetcher = sources => ({
  dataUrl$: ProjectImageFetcher(sources).projectImage$
    .map(p => p && p.dataUrl || `/${sparkly}`),
})

export const ProjectAvatar = sources => Avatar({...sources,
  src$: Fetcher(sources).dataUrl$,
})

