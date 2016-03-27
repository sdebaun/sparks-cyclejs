import {ListItemNavigating} from 'components/sdm'

import {TeamImages} from 'components/remote'

const sparkly = require('images/pitch/sparklerHeader-2048.jpg')

const TeamItemNavigating = sources => {
  const image$ = sources.item$.pluck('$key')
    .flatMapLatest(TeamImages.query.one(sources))

  return ListItemNavigating({...sources,
    iconSrc$: image$.map(i => i && i.dataUrl || '/' + sparkly),
    title$: sources.item$.pluck('name'),
    path$: sources.path$ || sources.item$.map(({$key}) => '/team/' + $key),
  })
}

export {TeamItemNavigating}
