import {Observable} from 'rx'
const {just} = Observable
import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'cycle-snabbdom'
import listItem from 'helpers/listItem'

import {ToggleControl} from 'components/sdm'

const ListItemClickable = sources => {
  const click$ = sources.DOM.select('.item').events('click')

  const viewState = {
    iconDOM$: sources.iconDOM$ || just(null),
    title$: sources.title$ || just('no title$'),
    subtitle$: sources.title$ || just(null),
  }

  const DOM = combineLatestObj(viewState)
    .map(({iconDOM, title, subtitle}) =>
      div({},[listItem({ //need extra div for isolate
        title,
        subtitle,
        iconDOM,
        className: 'item',
        clickable: true,
      })])
    )

  return {
    click$,
    DOM,
  }
}

const ListItemToggle = sources => {
  const toggle = ToggleControl(sources)

  const item = ListItemClickable({...sources,
    iconDOM$: toggle.DOM,
    title$: sources.value$.flatMapLatest(v =>
      v ? sources.titleTrue$ : sources.titleFalse$
    ),
  })

  return {
    DOM: item.DOM,
    value$: toggle.value$,
  }
}

export {
  ListItemClickable,
  ListItemToggle,
}
