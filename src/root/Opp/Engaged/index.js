import {Observable} from 'rx'
const {of} = Observable

import ComingSoon from 'components/ComingSoon'
import {TabbedPage} from 'components/ui'

const Confirmed = ComingSoon('Manage/Glance/Confirmed')
import Applied from './Applied'
const Accepted = ComingSoon('Manage/Glance/Accepted')

export default sources => ({
  pageTitle: of('At a Glance'),

  ...TabbedPage({...sources,
    tabs$: of([
      {path: '/', label: 'Confirmed'},
      {path: '/applied', label: 'Applied'},
      {path: '/accepted', label: 'Accepted'},
    ]),
    routes$: of({
      '/': Confirmed,
      '/applied': Applied,
      '/accepted': Accepted,
    }),
  }),
})
