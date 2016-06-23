import {Observable} from 'rx'
const {of} = Observable

import ComingSoon from 'components/ComingSoon'
import {TabbedPage} from 'components/ui'

import Priority from './Priority'
import Arrivals from './Arrivals'
import Checkin from './Checkin'

// const Checkin = ComingSoon('Checkin')
const Recently = ComingSoon('Manage/Glance/Recently')

export default sources => ({
  pageTitle: of('At a Glance'),

  ...TabbedPage({...sources,
    tabs$: of([
      {path: '/', label: 'Priority'},
      {path: '/arrivals', label: 'Arrivals'},
      {path: '/checkin', label: 'Checkin'},
      // {path: '/find', label: 'Find'},
      // {path: '/recently', label: 'Recently'},
    ]),
    routes$: of({
      '/': Priority,
      '/arrivals': Arrivals,
      '/checkin': Checkin,
      '/recently': Recently,
    }),
  }),
})
