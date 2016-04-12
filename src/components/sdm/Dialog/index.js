import {Observable} from 'rx'
const {just, merge, empty} = Observable

import combineLatestObj from 'rx-combine-latest-obj'

import {Dialog as SmDialog} from 'snabbdom-material'
import {div} from 'cycle-snabbdom'

import {OkAndCancel} from 'components/sdm/Button'

import {AccentToolbar} from 'components/sdm/Toolbar'

import {icon, iconSrc} from 'helpers'

const dialogStyle = {
  marginTop: '-15em',
  minWidth: '400px',
  width: 'auto',
}

const contentStyle = {
  padding: '0em 1em 1em 1em',
}

const modal = ({isOpen, toolbarDOM, contentDOM, actionsDOM}) =>
  SmDialog({
    isOpen,
    noPadding: true,
    style: dialogStyle,
    title: toolbarDOM,
    footer: actionsDOM,
  },[
    div({style: contentStyle}, [contentDOM]),
  ])

const Dialog = sources => {
  // hax to capture close click from SmDialog
  const maskClose$ = sources.DOM.select('.close').events('click')

  const actionsComponent$ =
    sources.actionsComponent$ || just(OkAndCancel(sources))

  const toolbar = AccentToolbar({...sources,
    leftItemDOM$: sources.iconUrl$ && sources.iconUrl$
      .map(src => src && iconSrc(src) || '') ||
      sources.iconName$ && sources.iconName$.map(icon),
  })

  const isOpen$ = merge(
    sources.isOpen$,
    actionsComponent$.pluck('ok$').switch().map(false),
    actionsComponent$.pluck('cancel$').switch().map(false),
    maskClose$.map(false),
  ).startWith(false)

  const viewState = {
    isOpen$,
    toolbarDOM$: toolbar.DOM,
    contentDOM$: sources.contentDOM$,
    actionsDOM$: actionsComponent$.pluck('DOM').switch(),
  }

  const DOM = combineLatestObj(viewState)
    .map(({isOpen, toolbarDOM, contentDOM, actionsDOM}) =>
      modal({
        isOpen,
        toolbarDOM,
        contentDOM,
        actionsDOM,
      })
    )

  return {
    DOM,
    value$: actionsComponent$.map(a => a.value$ || empty()).switch(),
    submit$: actionsComponent$.map(a => a.ok$ || empty()).switch(),
    close$: actionsComponent$.map(a => a.cancel$ || empty()).switch(),
  }
}

export {Dialog}
