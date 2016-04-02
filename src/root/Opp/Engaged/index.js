import {Observable} from 'rx'
import TabBar from 'components/TabBar'
import ComingSoon from 'components/ComingSoon'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'

// import Describe from './Describe'
import Applied from './Applied'

const Confirmed = ComingSoon('Manage/Glance/Confirmed')
// const Applied = ComingSoon('Manage/Glance/Applied')
const Accepted = ComingSoon('Manage/Glance/Accepted')

const _routes = {
  '/': Confirmed,
  '/applied': Applied,
  '/accepted': Accepted,
}

const _tabs = [
  {path: '/', label: 'Confirmed'},
  {path: '/applied', label: 'Applied'},
  {path: '/accepted', label: 'Accepted'},
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
