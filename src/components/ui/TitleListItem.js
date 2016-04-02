import {Observable} from 'rx'
const {just} = Observable

import {
  ListItem,
} from 'components/sdm'

const TitleListItem = sources => ListItem({...sources,
  classes$: just({'list-item-title': true}),
})

export {TitleListItem}
