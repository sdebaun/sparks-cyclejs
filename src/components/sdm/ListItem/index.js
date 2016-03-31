require('./styles.scss')

import {Observable} from 'rx'
const {just, empty, merge, combineLatest} = Observable
import combineLatestObj from 'rx-combine-latest-obj'
// import isolate from '@cycle/isolate'

import {div} from 'cycle-snabbdom'
import {icon, iconSrc} from 'helpers'

import {ToggleControl, TextAreaControl} from 'components/sdm'
import {Dialog} from 'components/sdm'
import {Menu} from 'components/sdm'
import {OkAndCancel} from 'components/sdm'

import {log} from 'util'

const liClasses = {'list-item': true}

const contentClass = (...doms) =>
  '.content.xcol-sm-' +
  (12 - doms.filter(i => !!i).length)

const listItem = ({leftDOM, title, subtitle, rightDOM, classes}) =>
  div({class: {...liClasses, ...classes}}, [
    leftDOM && div('.left.xcol-sm-1', [leftDOM]),
    div(contentClass(leftDOM,rightDOM), [
      div('.title', [title]),
      subtitle && div('.subtitle', [subtitle]),
    ].filter(i => !!i)),
    rightDOM && div('.right.xcol-sm-1',[rightDOM]),
  ].filter(i => !!i))

const ListItem = sources => {
  const viewState = {
    classes$: sources.classes$ || just({}),
    leftDOM$: sources.leftDOM$ ||
      sources.iconName$ && sources.iconName$.map(n => icon(n)) ||
      sources.iconSrc$ && sources.iconSrc$.map(url => iconSrc(url)) ||
      just(null),
    title$: sources.title$ || just('no title$'),
    subtitle$: sources.subtitle$ || just(null),
    rightDOM$: sources.rightDOM$ || just(null),
  }

  const DOM = combineLatestObj(viewState)
    .map(({leftDOM, title, subtitle, rightDOM, classes}) =>
      div({},[listItem({ //need extra div for isolate
        title,
        subtitle,
        rightDOM,
        leftDOM,
        classes,
      })])
    )

  return {
    DOM,
  }
}

const ListItemClickable = sources => {
  const classes$ = (sources.classes$ || just({}))
    .map(c => ({...c, clickable: true}))

  return {
    click$: sources.DOM.select('.list-item').events('click'),

    DOM: ListItem({...sources, classes$}).DOM,
  }
}

const ListItemToggle = sources => {
  const toggle = ToggleControl(sources)

  const item = ListItemClickable({...sources,
    leftDOM$: toggle.DOM,
    title$: sources.value$.flatMapLatest(v =>
      v ? sources.titleTrue$ : sources.titleFalse$
    ),
  })

  const value$ = sources.value$
    .sample(item.click$)
    .map(x => !x)

  return {
    DOM: item.DOM,
    value$,
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

  const iconName$ = sources.dialogIconName$ || sources.iconName$

  const dialog = Dialog({...sources,
    isOpen$: _listItem.click$.map(true),
    titleDOM$: sources.dialogTitleDOM$,
    iconName$,
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

const ListItemCollapsible = sources => {
  const li = ListItemClickable(sources)

  const isOpen$ = (sources.isOpen$ || empty())
    .merge(li.click$.map(-1))
    .scan((a,x) => x === -1 ? !a : x)
    .startWith(false)

  const viewState = {
    isOpen$,
    listItemDOM$: li.DOM,
    contentDOM$: sources.contentDOM$ || just(div({},['no contentDOM$'])),
  }

  const DOM = combineLatestObj(viewState)
    .map(({isOpen, listItemDOM, contentDOM}) =>
      div({},[listItemDOM, isOpen && contentDOM].filter(i => !!i))
    )

  return {
    DOM,
  }
}

const ListItemCollapsibleTextArea = sources => {
  const ta = TextAreaControl(sources)
  const oac = OkAndCancel(sources)
  const li = ListItemCollapsible({...sources,
    contentDOM$: combineLatest(ta.DOM, oac.DOM, (...doms) => div({},doms)),
    isOpen$: (sources.isOpen$ || empty())
      .merge(oac.ok$.map(false), oac.cancel$.map(false)),
  })

  return {
    DOM: li.DOM,
    value$: ta.value$.sample(oac.ok$),
  }
}

const ListItemTextArea = sources => {
  const ta = TextAreaControl(sources)
  const oac = OkAndCancel(sources)
  const li = ListItem({...sources,
    title$: combineLatest(ta.DOM, oac.DOM, (...doms) => div({},doms)),
  })

  return {
    DOM: li.DOM,
    value$: ta.value$.sample(oac.ok$),
  }
}

const ListItemHeader = sources =>
  ListItem({...sources, classes$: just({header: true})})

export {
  ListItem,
  ListItemClickable,
  ListItemToggle,
  ListItemWithMenu,
  ListItemNavigating,
  ListItemWithDialog,
  ListItemCollapsible,
  ListItemCollapsibleTextArea,
  ListItemTextArea,
  ListItemHeader,
}
