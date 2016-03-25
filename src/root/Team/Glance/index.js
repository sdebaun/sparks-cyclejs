import {Observable} from 'rx'
import TabBar from 'components/TabBar'
import ComingSoon from 'components/ComingSoon'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'

import Priority from './Priority'
// const Priority = ComingSoon('Manage/Glance/Priority')
const Find = ComingSoon('Manage/Glance/Find')
const Recently = ComingSoon('Manage/Glance/Recently')

const _routes = {
  '/': Priority,
  '/find': Find,
  '/recently': Recently,
}

const _tabs = [
  {path: '/', label: 'Priority'},
  {path: '/find', label: 'Find'},
  {path: '/recently', label: 'Recently'},
]

export default sources => {
  const page$ = nestedComponent(
    sources.router.define(_routes), sources,
  )

  const tabBar = TabBar({...sources, tabs: Observable.just(_tabs)})

  const children = [page$, tabBar]

  const DOM = page$.flatMapLatest(page => page.DOM)

  const tabBarDOM = tabBar.DOM

  const pageTitle = Observable.just('At a Glance')

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
