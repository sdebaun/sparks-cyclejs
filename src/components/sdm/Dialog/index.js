import {Observable} from 'rx'
const {merge, just} = Observable

import combineLatestObj from 'rx-combine-latest-obj'

import {Dialog as SmDialog} from 'snabbdom-material'
import {div, span} from 'cycle-snabbdom'

import {RaisedButton} from 'components/sdm/RaisedButton'
import {FlatButton} from 'components/sdm/FlatButton'

import {AccentToolbar} from 'components/sdm/Toolbar'

const dialogStyle = {
  minWidth: '400px',
}

const contentStyle = {
  padding: '0em 1em 1em 1em',
}

const modal = ({isOpen, toolbarDOM, contentDOM, okDOM, cancelDOM}) =>
  SmDialog({
    isOpen,
    noPadding: true,
    style: dialogStyle,
    title: toolbarDOM,
    footer: span({},[okDOM, cancelDOM]),
  },[
    div({style: contentStyle}, [contentDOM]),
  ])

const Dialog = sources => {
  // hax to capture close click from SmDialog
  const maskClose$ = sources.DOM.select('.close').events('click')

  const ok = RaisedButton({...sources,
    label$: sources.okLabel$ || just('OK'),
  })

  const cancel = FlatButton({...sources,
    label$: sources.cancelLabel$ || just('Cancel'),
  })

  const toolbar = AccentToolbar({...sources})

  const isOpen$ = merge(
    sources.isOpen$,
    ok.click$.map(false),
    cancel.click$.map(false),
    maskClose$.map(false),
  ).startWith(false)

  const viewState = {
    isOpen$,
    toolbarDOM$: toolbar.DOM,
    contentDOM$: sources.contentDOM$,
    okDOM: ok.DOM,
    cancelDOM: cancel.DOM,
  }

  const DOM = combineLatestObj(viewState)
    .map(({isOpen, toolbarDOM, contentDOM, okDOM, cancelDOM}) =>
      modal({
        isOpen,
        toolbarDOM,
        contentDOM,
        okDOM,
        cancelDOM,
      })
    )

  return {
    DOM,
    submit$: ok.click$,
    close$: cancel.click$,
  }
}

export {Dialog}
