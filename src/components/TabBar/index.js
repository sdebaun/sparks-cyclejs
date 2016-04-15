import {Observable} from 'rx'
const {of, never} = Observable

import {div,h} from 'cycle-snabbdom'

import {material} from 'util'

import './styles.scss'

import {controlsFromRows, combineDOMsToDiv, mergeOrFlatMapLatest} from 'util'
import {log} from 'util'

// const tabs = (props,children) =>
//   children && div({class: {'tab-wrap': true}, style: {
//     // 'background-color': material.primaryColor,
//   }},
//     children.reduce((a,b) => a.concat(b))
//       .concat([div({class: {slide: true}},'')])
//   )

const tab = ({id, link},children) => [
  h('input',{attrs: {type: 'radio', name: 'tabs', id}}),
  div({class: {'tab-label-content': true}, attrs: {'data-link': link}},[
    h('label',{attrs: {for: id}, style: {
      color: material.primaryFontColor},
    },children),
  ]),
]

// const _DOM = createHref => _tabs =>
//   tabs({}, _tabs.map(({path,label}) =>
//     tab({id: label, link: createHref(path)},label)
//   ))

// const xTabBar = sources => {
//   const navigate$ = sources.DOM.select('.tab-label-content').events('click')
//     .map(event => event.ownerTarget.dataset.link)
//     .distinctUntilChanged()

//   const DOM = sources.tabs.map(_DOM(sources.router.createHref))

//   navigate$.subscribe(log('tabs.navigate$'))

//   return {
//     DOM,
//     route$: navigate$,
//   }
// }

// export const controlsFromRows = (sources, rows, Control) =>
//   rows.map((row, i) =>
//     isolate(Control,row.$key)({
//       ...sources,
//       item$: just(row),
//       index$: just(i),
//     }))

const _view = ({label}) =>
  div({class: {'tab-label-content': true}},[
    h('label',{attrs: {for: label}, style: {
      color: material.primaryFontColor},
    },[label]),
  ])
// const _view = ({label}) => div('',[
//   h('input',{attrs: {type: 'radio', name: 'tabs', id: label}}),
//   div({class: {'tab-label-content': true}},[
//     h('label',{attrs: {for: label}, style: {
//       color: material.primaryFontColor},
//     },[label]),
//   ]),
// ])

// const Tab = sources => ({
//   // DOM: sources.item$.map(i => div('',[i.label])),
//   DOM: sources.item$.map(_view),
//   route$: sources.item$.pluck('path')
//     .sample(sources.DOM.select('div').events('click')),
// })

const Tab = sources => {
  const click$ = sources.DOM.select('div').events('click')
  const path$ = sources.item$.pluck('path')
    .map(p => sources.router.createHref(p))

  return {
    DOM: sources.item$.map(_view),
    route$: click$.withLatestFrom(path$, (c,p) => p),
  }
}

const TabBar = sources => {
  sources.tabs$.subscribe(t => console.log('tabs$',t))
  const tctrls$ = sources.tabs$.map(tabs =>
    controlsFromRows(sources, tabs.map((t,i) => ({$key: `${i}`, ...t})), Tab)
  ).shareReplay(1)

  return {
    DOM: tctrls$.map(c => combineDOMsToDiv('.tab-wrap',...c)).switch(),
    route$: tctrls$.map(c => mergeOrFlatMapLatest('route$', ...c)).switch(),
  }
}

export {TabBar}
