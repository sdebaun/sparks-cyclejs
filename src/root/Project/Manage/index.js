import {Observable} from 'rx'
const {of} = Observable

import ComingSoon from 'components/ComingSoon'
import {TabbedPage} from 'components/ui'

import Describe from './Describe'
import Staff from './Staff'
const Connect = ComingSoon('Manage/Connect')

export default sources => ({
  pageTitle: of('Manage Project'),

  ...TabbedPage({...sources,
    tabs$: of([
      {path: '/', label: 'Describe'},
      {path: '/staff', label: 'Staff'},
      // {path: '/connect', label: 'Connect'},
    ]),
    routes$: of({
      '/': Describe,
      '/staff': Staff,
      '/connect': Connect,
    }),
  }),
})
