import {Observable} from 'rx'
const {just} = Observable
import {prop} from 'ramda'

import {
  ListItemClickable,
} from 'components/sdm'

const OrganizerAcceptedItem = sources => {
  const listItem = ListItemClickable({...sources,
    iconName$: just('check'),
    title$: sources.item$.map(prop('inviteEmail')),
    subtitle$: sources.item$.map(prop('authority')),
  })

  return {
    DOM: listItem.DOM,
  }
}

export default OrganizerAcceptedItem
