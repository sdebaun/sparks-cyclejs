import {Observable} from 'rx'
const {just} = Observable

import {List, ListItemNavigating} from 'components/sdm'

const ProjectItem = sources => ListItemNavigating({...sources,
  title$: sources.item$.map(({name}) => name),
  subtitle$: just('owner'),
  path$: sources.item$.map(({$key}) => '/project/' + $key),
})

const ProjectList = sources => List({...sources,
  Control$: just(ProjectItem),
})

export {ProjectList}
