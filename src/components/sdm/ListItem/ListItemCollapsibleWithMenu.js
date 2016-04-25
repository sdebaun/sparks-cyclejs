import {Observable as $} from 'rx'

import isolate from '@cycle/isolate'

import {div} from 'cycle-snabbdom'
import {icon} from 'helpers'

import {ListItem} from './ListItem'

import {Menu} from 'components/sdm'
import {FlatButton} from 'components/sdm'

import {combineDOMsToDiv} from 'util'

// should replace the one in SDM
// and have a ListItemClickableCollapsible or somesuch for pure collapsers
const ListItemCollapsible = sources => {
  const isOpen$ = sources.isOpen$ || $.of(false)
  const contentDOM$ = sources.contentDOM$ || $.of(div({},['no contentDOM$']))

  const li = ListItem({...sources, classes$: $.of({clickable: true})})

  const DOM = $.combineLatest(
    isOpen$, li.DOM, contentDOM$,
    (isOpen, listItemDOM, contentDOM) =>
      div('.clickable',[
        listItemDOM,
        isOpen && div('.collapsible',[contentDOM]),
      ].filter(i => !!i))
  )

  return {
    DOM,
  }
}

const MenuButton = sources => {
  const btn = FlatButton({...sources, label$: $.of(icon('menu'))})

  const isOpen$ = btn.click$.map(true).startWith(false)
  const children$ = sources.menuItems$ || $.just([])

  const menu = Menu({
    ...sources,
    isOpen$,
    children$,
    leftAlign$: $.of(false),
  })

  return {
    DOM: combineDOMsToDiv('', btn, menu),
  }
}

export const ListItemCollapsibleWithMenu = sources => {
  const mb = isolate(MenuButton)(sources)

  const click$ = $.merge(
    sources.DOM.select('.left').events('click'),
    sources.DOM.select('.content').events('click'),
  ).map(-1)

  const isOpen$ = $.merge(
    sources.isOpen$ || $.just(false),
    click$,
  )
  .scan((acc, next) => next === -1 ? !acc : next, false)
  .startWith(false)

  return ListItemCollapsible({...sources,
    isOpen$,
    rightDOM$: mb.DOM,
  })
}
