import {Observable} from 'rx'

import {col} from 'helpers'
import listItem from 'helpers/listItem'
import listItemDisabled from 'helpers/listItemDisabled'

const _render = () =>
  col(
    listItem({
      iconName: 'playlist_add',
      title: 'What do you need from your volunteers?',
      className: 'give',
      iconBackgroundColor: 'yellow',
    }),
    listItemDisabled({
      iconName: 'playlist_add',
      title: 'What benefits do your volunteers recieve this experience?',
    })
  )

export default sources => {
  const {router: {createHref}} = sources

  const route$ = sources.DOM.select('.give').events('click')
    .map(createHref('/give'))

  const DOM = Observable.just(true).map(_render)

  return {DOM, route$}
}
