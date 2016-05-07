import {Observable} from 'rx'
const {combineLatest} = Observable

import {div,h} from 'cycle-snabbdom'

import {material} from 'util'

import './styles.scss'

import {controlsFromRows, combineDOMsToDiv, mergeOrFlatMapLatest} from 'util'
// import {log} from 'util'

const _view = ({label}) =>
  div({class: {'tab-label-content': true}},[
    h('label',{attrs: {for: label}, style: {
      color: material.secondaryFontColor},
    },[label]),
  ])

const Tab = sources => {
  const click$ = sources.DOM.select('div').events('click')
  const path$ = sources.item$.pluck('path')
    .map(p => sources.router.createHref(p))

  return {
    DOM: sources.item$.map(_view),
    route$: click$.withLatestFrom(path$, (c,p) => p),
  }
}

const isBetter = (cur, next, best) =>
  cur.includes(next) && next.length > best.length

const bestMatchIdx = (curPath, paths) =>
  paths.reduce((bestIdx,nextPath,i) =>
    isBetter(curPath,nextPath,paths[bestIdx]) ? i : bestIdx,
    0
  )

const dist = (curPath, tabs, createHref) =>
  bestMatchIdx(curPath, tabs.map(t => createHref(t.path))) * 100 / tabs.length

const Slide = sources => {
  const DOM = combineLatest(
    sources.tabs$,
    sources.router.observable.pluck('pathname'),
    (t,p) =>
      div({
        class: {slide: true},
        style: {
          width: `${100 / t.length}%`,
          left: `${dist(p,t,sources.router.createHref)}%`,
        },
      },['']),
  )
  return {
    DOM,
  }
}

const TabBar = sources => {
  const sl = Slide(sources)
  const tctrls$ = sources.tabs$.map(tabs =>
    controlsFromRows(sources, tabs.map((t,i) => ({$key: `${i}`, ...t})), Tab)
  ).shareReplay(1)

  return {
    DOM: tctrls$.map(c => combineDOMsToDiv('.tab-wrap', ...c, sl)).switch(),
    route$: tctrls$.map(c => mergeOrFlatMapLatest('route$', ...c)).switch(),
  }
}

export {TabBar}
