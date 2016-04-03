import {Observable} from 'rx'
const {just} = Observable

import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'helpers'

import {Select} from 'snabbdom-material'

// import {log} from 'util'

const optionIndex = e => // because children is not a real js array
  [...e.target.parentNode.children]
    .indexOf(e.ownerTarget || e.target)

const SelectControl = sources => {
  const options$ = sources.options$.shareReplay(1)

  const selection$ = sources.DOM.select('.menu-item').events('click')
    .flatMapLatest(e => options$.map(options => options[optionIndex(e)]))
    .pluck('value')

  const value$ = (sources.value$ || just(null))
    .merge(selection$)

  const openClick$ = sources.DOM.select('.input-group').events('click')
  const closeClick$ = sources.DOM.select('.mask').events('click')

  const isOpen$ = Observable.merge(
    openClick$.map(true),
    selection$.map(false),
    closeClick$.map(false),
  ).startWith(false)

  const viewState = {
    isOpen$,
    label$: sources.label$ || just(null),
    value$,
    options$,
    classNames$: sources.classNames$ || just([]),
  }

  const DOM = combineLatestObj(viewState)
    .map(({isOpen, label, value, options, classNames}) =>
      div({},[
        Select({
          isOpen, label, value, options,
          className: ['input', ...classNames].join(' '),
        }),
      ])
    )

  return {
    DOM,
    value$,
  }
}

export {SelectControl}
