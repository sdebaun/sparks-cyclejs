import {Observable} from 'rx'
const {just} = Observable
import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'cycle-snabbdom'
import listItem from 'helpers/listItem'

import {ToggleControl} from 'components/sdm'

import {Menu} from 'components/sdm'

const ListItemClickable = sources => {
  const click$ = sources.DOM.select('.item').events('click')

  const viewState = {
    iconDOM$: sources.iconDOM$ || just(null),
    iconName$: sources.iconName$ || just(null),
    title$: sources.title$ || just('no title$'),
    subtitle$: sources.subtitle$ || just(null),
  }

  const DOM = combineLatestObj(viewState)
    .map(({iconDOM, iconName, title, subtitle}) =>
      div({},[listItem({ //need extra div for isolate
        title,
        subtitle,
        iconDOM,
        iconName,
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

const ListItemWithMenu = sources => {
  const item = ListItemClickable(sources)

  const isOpen$ = item.click$.map(true).startWith(false)

  const children$ = sources.menuItems$ || just([])

  const menu = Menu({
    ...sources,
    isOpen$,
    children$,
  })

  const viewState = {
    itemDOM$: item.DOM,
    menuDOM$: menu.DOM,
  }

  const DOM = combineLatestObj(viewState)
    .map(({itemDOM, menuDOM}) =>
      div({},[itemDOM, menuDOM])
    )

  return {
    DOM,
  }
}

export {
  ListItemClickable,
  ListItemToggle,
  ListItemWithMenu,
}
