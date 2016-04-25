import {Observable as $} from 'rx'
import {ListItem} from './ListItem'

export const ListItemClickable = sources => {
  const classes$ = (sources.classes$ || $.just({}))
    .map(c => ({clickable: true, ...c}))

  return {
    click$: sources.DOM.select('.list-item').events('click'),

    DOM: ListItem({...sources, classes$}).DOM,
  }
}
