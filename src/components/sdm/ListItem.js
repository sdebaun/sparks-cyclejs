import {Observable} from 'rx'
const {just} = Observable
import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'cycle-snabbdom'
import listItem from 'helpers/listItem'
import {icon} from 'helpers'

import {ToggleControl} from 'components/sdm'
import {Dialog} from 'components/sdm'
import {Menu} from 'components/sdm'

const ListItemClickable = sources => {
  const click$ = sources.DOM.select('.item').events('click')

  const viewState = {
    iconDOM$: sources.iconDOM$ || just(null),
    iconName$: sources.iconName$ || just(null),
    iconSrc$: sources.iconSrc$ || just(null),
    title$: sources.title$ || just('no title$'),
    subtitle$: sources.subtitle$ || just(null),
  }

  const DOM = combineLatestObj(viewState)
    .map(({iconDOM, iconName, iconSrc, title, subtitle}) =>
      div({},[listItem({ //need extra div for isolate
        title,
        subtitle,
        iconDOM,
        iconName,
        iconSrc,
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

const ListItemNavigating = sources => {
  const item = ListItemClickable(sources)

  const route$ = item.click$
    .flatMapLatest(sources.path$ || just('/'))

  return {
    DOM: item.DOM,
    route$,
  }
}

const ListItemWithDialog = sources => {
  const _listItem = ListItemClickable(sources)

  const dialog = Dialog({...sources,
    isOpen$: _listItem.click$.map(true),
    titleDOM$: sources.dialogTitleDOM$,
    leftItemDOM$: sources.iconName$.map(icon),
    contentDOM$: sources.dialogContentDOM$,
  })

  const DOM = combineLatestObj({
    listItemDOM$: _listItem.DOM,
    dialogDOM$: dialog.DOM,
  }).map(({
    listItemDOM,
    dialogDOM,
  }) =>
    div({},[listItemDOM, dialogDOM])
  )

  return {
    DOM,
    submit$: dialog.submit$,
  }
}

export {
  ListItemClickable,
  ListItemToggle,
  ListItemWithMenu,
  ListItemNavigating,
  ListItemWithDialog,
}
