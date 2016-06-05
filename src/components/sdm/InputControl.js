import {Observable} from 'rx'
const {just} = Observable

import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'helpers'

import {Input} from 'snabbdom-material'

const InputControl = sources => {
  const input$ = sources.DOM.select('.input').events('input')
  const key$ = sources.DOM.select('.input').events('keydown')

  const value$ = (sources.value$ || just(null))
    .merge(input$.pluck('target', 'value'))

  const viewState = {
    label$: sources.label$ || just(null),
    value$,
    classNames$: sources.classNames$ || just([]),
  }

  const DOM = combineLatestObj(viewState)
    .map(({label, value, classNames}) =>
      div({},[
        Input({label, value, className: ['input', ...classNames].join('.')}),
      ])
    )

  return {
    DOM,
    value$,
    key$,
  }
}

export {InputControl}
