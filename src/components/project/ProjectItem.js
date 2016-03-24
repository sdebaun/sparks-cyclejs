import {ListItemNavigating} from 'components/sdm'

import {ProjectImages} from 'components/remote'

const ProjectItem = sources => {
  const projectImage$ = sources.item$.pluck('$key')
    .flatMapLatest(ProjectImages.query.one(sources))

  return ListItemNavigating({...sources,
    iconSrc$: projectImage$.map(i => i && i.dataUrl),
    title$: sources.item$.pluck('name'),
    path$: sources.path$ || sources.item$.map(({$key}) => '/project/' + $key),
  })
}

export {ProjectItem}
