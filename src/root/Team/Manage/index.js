import {Observable} from 'rx'
const {of} = Observable

import ComingSoon from 'components/ComingSoon'
import {TabbedPage} from 'components/ui'

import Describe from './Describe'
const Leads = ComingSoon('Manage/Glance/Leads')
import Applying from './Applying'

export default sources => ({
  pageTitle: of('Manage Team'),

  ...TabbedPage({...sources,
    tabs$: of([
      {path: '/', label: 'Describe'},
      // {path: '/leads', label: 'Leads'},
      {path: '/applying', label: 'Applying'},
    ]),
    routes$: of({
      '/': Describe,
      '/leads': Leads,
      '/applying': Applying,
    }),
  }),
})
