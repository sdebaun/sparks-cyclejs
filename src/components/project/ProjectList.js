import {Observable} from 'rx'
const {just} = Observable

import {List, ListItemNavigating} from 'components/sdm'

import {ProjectImages} from 'components/remote'

const ProjectItem = sources => {
  const projectImage$ = sources.item$.pluck('$key')
    .flatMapLatest(ProjectImages.query.one(sources))

  return ListItemNavigating({...sources,
    iconSrc$: projectImage$.map(i => i && i.dataUrl),
    title$: sources.item$.pluck('name'),
    subtitle$: just('owner'),
    path$: sources.item$.map(({$key}) => '/project/' + $key),
  })
}

const ProjectList = sources => List({...sources,
  Control$: just(ProjectItem),
})

export {ProjectList}
