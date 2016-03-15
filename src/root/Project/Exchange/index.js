import {Observable} from 'rx'
import isolate from '@cycle/isolate'
import TabBar from 'components/TabBar'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'

import Priority from './Priority'
import Give from './Give'
import Benefits from './Benefits'

const _routes = {
  '/': isolate(Priority),
  '/give': isolate(Give),
  '/benefits': isolate(Benefits),
}

const _tabs = [
  {path: '/', label: 'Priority'},
  {path: '/give', label: 'Give'},
  {path: '/benefits', label: 'Benefits'},
]

export default sources => {
  const page$ = nestedComponent(
    sources.router.define(_routes), sources,
  )

  const tabBar = TabBar({...sources, tabs: Observable.just(_tabs)})

  const children = [page$, tabBar]

  const DOM = page$.flatMapLatest(page => page.DOM)

  const tabBarDOM = tabBar.DOM

  const pageTitle = Observable.just('Exchange')

  const auth$ = mergeOrFlatMapLatest('auth$', ...children)

  const queue$ = mergeOrFlatMapLatest('queue$', ...children)

  const route$ = mergeOrFlatMapLatest('route$', ...children)

  return {
    DOM,
    tabBarDOM,
    pageTitle,
    auth$,
    queue$,
    route$,
  }
}
