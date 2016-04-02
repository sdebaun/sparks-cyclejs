import {Observable} from 'rx'
const {just} = Observable

import {
  ListItem,
} from 'components/sdm'

const DescriptionListItem = sources => ListItem({...sources,
  title$: sources.item$.pluck('description'),
  classes$: just({description: true}), // no styling yet but here's where
})

export {DescriptionListItem}
