import {Observable} from 'rx'
const {of} = Observable

import ComingSoon from 'components/ComingSoon'
import {TabbedPage} from 'components/ui'

const Confirmed = ComingSoon('Manage/Glance/Confirmed')
import Applied from './Applied'
const Approved = ComingSoon('Manage/Glance/Approved')

export default sources => ({
  pageTitle: of('Team Members'),

  ...TabbedPage({...sources,
    tabs$: of([
      {path: '/', label: 'Confirmed'},
      {path: '/applied', label: 'Applied'},
      {path: '/approved', label: 'Approved'},
    ]),
    routes$: of({
      '/': Confirmed,
      '/applied': Applied,
      '/approved': Approved,
    }),
  }),
})
