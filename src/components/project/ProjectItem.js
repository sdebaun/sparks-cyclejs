import {ListItemNavigating} from 'components/sdm'

import {ProjectImages} from 'components/remote'

const sparkly = require('images/pitch/sparklerHeader-2048.jpg')

const ProjectItem = sources => {
  const projectImage$ = sources.item$.pluck('$key')
    .flatMapLatest(ProjectImages.query.one(sources))

  return ListItemNavigating({...sources,
    iconSrc$: projectImage$.map(i => i && i.dataUrl || '/' + sparkly),
    title$: sources.item$.pluck('name'),
    path$: sources.path$ || sources.item$.map(({$key}) => '/project/' + $key),
  })
}

export {ProjectItem}
