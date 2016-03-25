import {Observable} from 'rx'
const {merge} = Observable

import combineLatestObj from 'rx-combine-latest-obj'

import {Dialog as SmDialog} from 'snabbdom-material'
import {div, span} from 'cycle-snabbdom'

import {OkAndCancel} from 'components/sdm/Button'

import {AccentToolbar} from 'components/sdm/Toolbar'

const dialogStyle = {
  minWidth: '400px',
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

  const oac = OkAndCancel(sources)

  const toolbar = AccentToolbar({...sources})

  const isOpen$ = merge(
    sources.isOpen$,
    oac.ok$.map(false),
    oac.cancel$.map(false),
    maskClose$.map(false),
  ).startWith(false)

  const viewState = {
    isOpen$,
    toolbarDOM$: toolbar.DOM,
    contentDOM$: sources.contentDOM$,
    actionsDOM$: oac.DOM,
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
    submit$: oac.ok$,
    close$: oac.cancel$,
  }
}

export {Dialog}
