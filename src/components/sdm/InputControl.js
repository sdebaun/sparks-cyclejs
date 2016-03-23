import {Observable} from 'rx'
const {just} = Observable

import combineLatestObj from 'rx-combine-latest-obj'

import {Input} from 'snabbdom-material'

// import {log} from 'util'

import newId from './id'

const InputControl = sources => {
  const id = newId()

  const input$ = sources.DOM.select('.' + id).events('input')

  const value$ = (sources.value$ || just(null))
    .merge(input$.pluck('target','value'))

  const viewState = {
    label$: sources.label$ || just(null),
    value$,
    classNames$: sources.classNames$ || just([]),
  }

  const DOM = combineLatestObj(viewState)
    .map(({label, value, classNames}) =>
      Input({label, value, className: [id, ...classNames].join('.')})
    )

  return {
    DOM,
    value$,
  }
}

// export default ({label, className}) => sources => {
//   // render is nested so it can use factory args
//   const _render = ({value}) =>
//     Input({label, className, value})

//   const input$ = sources.DOM.select('.' + className).events('input')
//   input$.subscribe(log('input$'))

//   const value$ = (sources.value$ || Observable.just(null))
//     .merge(input$.pluck('target','value'))

//   const DOM = combineLatestObj({value$}).map(_render)

//   return {DOM, value$}
// }

export {InputControl}
