import {Observable} from 'rx'
// const {just} = Observable

// import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'helpers'
import {icon} from 'helpers'

// import {log} from 'util'

const ToggleControl = sources => ({
  click$: sources.DOM.select('.toggle').events('click'),

  DOM: sources.value$.map(v =>
    div({class: {toggle: true}},[
      v ?
      icon('toggle-on','accent') :
      icon('toggle-off'),
    ])
  ),
})

// const xToggleControl = sources => {
//   const click$ = sources.DOM.select('.toggle').events('click')

//   const sourceValue$ = (sources.value$ || Observable.just(false))
//     .startWith(false)

//   const value$ = sourceValue$
//     .sample(click$)
//     .map(value => !value)

//   const renderValue$ = sourceValue$.merge(value$)

//   const viewState = {
//     value$: renderValue$,
//     classNames$: sources.classNames$ || just([]),
//   }

//   const DOM = combineLatestObj(viewState)
//     .map(({value}) =>
//       div({class: {toggle: true}},[
//         value ? icon('toggle-on','green') : icon('toggle-off','#333'),
//       ])
//     )

//   return {
//     DOM,
//     value$,
//   }
// }

export {ToggleControl}
