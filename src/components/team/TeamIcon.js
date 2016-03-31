import {
  TeamImages,
} from 'components/remote'

import {icon, iconSrc} from 'helpers'

const TeamIcon = sources => ({
  DOM: sources.teamKey$
    .flatMapLatest(TeamImages.query.one(sources))
    .map(i => i && i.dataUrl && iconSrc(i.dataUrl) || icon('power')),
})

export {TeamIcon}
