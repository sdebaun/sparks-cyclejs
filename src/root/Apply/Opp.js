import {col} from 'helpers'

export default sources => {
  return {
    DOM: sources.oppKey$.map(oppKey => col(oppKey)),
  }
}
//   const title = Title({
//     labelText$: project$.pluck('name'),
//     subLabelText$: oppRows$.map(opps =>
//       opps.length + ' Opportunities Available'
//     ),
//     oppRows$,
//     ...sources,
//   })

//   const applyQuickNavMenu = ApplyQuickNavMenu({opps$, project$, ...sources})
//   // const applyQuickNavMenu = Observable.just({DOM: ['foo']})

//   const page$ = nestedComponent(sources.router.define(_routes),sources)

//   const pageDOM = col(
//     title.DOM,
//     applyQuickNavMenu.DOM,
//     page$.flatMapLatest(({DOM}) => DOM)
//   )

//   const frame = SoloFrame({pageDOM, ...sources})

//   const children = [frame, page$, applyQuickNavMenu]

//   const DOM = frame.DOM

//   const route$ = mergeOrFlatMapLatest('route$', ...children)

//   // const queue$ = frame.queue$

//   const auth$ = mergeOrFlatMapLatest('auth$', ...children)

//   return {
//     DOM,
//     route$,
//     // queue$,
//     auth$,
//   }
// }
