import {Observable as $} from 'rx'

import {ListItem} from './ListItem'

export const ListItemHeader = sources =>
  ListItem({...sources, classes$: $.just({header: true})})
