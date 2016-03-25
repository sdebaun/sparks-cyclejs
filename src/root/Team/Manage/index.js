import {Observable} from 'rx'
import TabBar from 'components/TabBar'
import ComingSoon from 'components/ComingSoon'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'

import Describe from './Describe'
import Applying from './Applying'

// const Describe = ComingSoon('Manage/Glance/Describe')
const Leads = ComingSoon('Manage/Glance/Leads')
// const Applying = ComingSoon('Manage/Glance/Applying')

const _routes = {
  '/': Describe,
  '/leads': Leads,
  '/applying': Applying,
}

const _tabs = [
  {path: '/', label: 'Describe'},
  {path: '/leads', label: 'Leads'},
  {path: '/applying', label: 'Applying'},
]

export default sources => {
  const page$ = nestedComponent(
    sources.router.define(_routes), sources,
  )

  const tabBar = TabBar({...sources, tabs: Observable.just(_tabs)})

  const children = [page$, tabBar]

  const DOM = page$.flatMapLatest(page => page.DOM)

  const tabBarDOM = tabBar.DOM

  const pageTitle = Observable.just('Manage')

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
