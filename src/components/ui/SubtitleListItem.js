import {Observable} from 'rx'
const {just} = Observable

import {
  ListItem,
} from 'components/sdm'

const SubtitleListItem = sources => ListItem({...sources,
  classes$: just({'list-item-subtitle': true}),
})

export {SubtitleListItem}
