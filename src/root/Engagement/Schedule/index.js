import {Observable} from 'rx'
const {of} = Observable

import ComingSoon from 'components/ComingSoon'
import {TabbedPage} from 'components/ui'

import Priority from './Priority'
// const Priority = ComingSoon('Manage/Glance/Priority')
const Find = ComingSoon('Manage/Glance/Find')
const Recently = ComingSoon('Manage/Glance/Recently')

export default sources => ({
  pageTitle: of('Your Schedule'),

  ...TabbedPage({...sources,
    tabs$: of([
      {path: '/', label: 'Priority'},
      {path: '/find', label: 'Find'},
      {path: '/recently', label: 'Recently'},
    ]),
    routes$: of({
      '/': Priority,
      '/find': Find,
      '/recently': Recently,
    }),
  }),
})
