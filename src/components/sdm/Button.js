//placeholder for replacement w cyclic-surface-material
import {Observable as $} from 'rx'
import {objOf} from 'ramda'
const {just, combineLatest} = $

// import isolate from '@cycle/isolate'

import combineLatestObj from 'rx-combine-latest-obj'
import {Button} from 'snabbdom-material'
import {div} from 'helpers'
import {span} from 'cycle-snabbdom'

import newId from './id'

const FlatButton = sources => {
  const id = newId()

  const viewState = {
    label$: sources.label$ || just('Button'),
    classNames$: sources.classNames$ || just([]),
  }

  const click$ = sources.DOM.select('.' + id).events('click')

  const DOM = combineLatestObj(viewState)
    .map(({label, classNames}) =>
      Button({
        onClick: true,
        flat: true,
        className: [id, ...classNames].join('.'),
      }, [
        label,
      ]),
    )

  return {
    DOM,
    click$,
  }
}

const RaisedButton = sources => {
  const id = newId()

  const viewState = {
    label$: sources.label$ || just('Button'),
    classNames$: sources.classNames$ || just([]),
  }

  const click$ = sources.DOM.select('.' + id).events('click')

  const DOM = combineLatestObj(viewState)
    .map(({label, classNames}) => span({},[
      Button({
        onClick: true,
        primary: true,
        className: [id, ...classNames].join('.'),
      }, [
        label,
      ]),
    ]))

  return {
    DOM,
    click$,
  }
}

const OkAndCancel = sources => {
  const ok = RaisedButton({...sources,
    label$: sources.okLabel$ || just('OK'),
  })
  const cancel = FlatButton({...sources,
    label$: sources.cancelLabel$ || just('Cancel'),
  })

  return {
    DOM: combineLatest(ok.DOM, cancel.DOM, (...DOMs) => div({},DOMs)),
    ok$: ok.click$,
    cancel$: cancel.click$,
  }
}

const OkAndCancelAndRemove = sources => {
  const ok = RaisedButton({...sources,
    label$: sources.okLabel$ || just('OK'),
  })
  const remove = RaisedButton({...sources,
    label$: sources.removeLabel$ || just('Remove'),
    classNames$: just(['accent']),
  })
  const cancel = FlatButton({...sources,
    label$: sources.cancelLabel$ || just('Cancel'),
  })

  const doms = [ok, remove, cancel].map(c => c.DOM)
  const action = objOf('action')

  return {
    DOM: combineLatest(
      sources.value$, ...doms,
      (val, okDOM, rDOM, cDOM) => div({},[
        okDOM,
        val && rDOM || null,
        cDOM,
      ])
    ),
    intent$: $.merge(
      ok.click$.map(action('ok')),
      remove.click$.map(action('remove')),
      cancel.click$.map(action('cancel')),
    ),
    ok$: ok.click$,
    remove$: remove.click$,
    cancel$: cancel.click$,
  }
}

export {
  RaisedButton,
  FlatButton,
  OkAndCancel,
  OkAndCancelAndRemove,
}
