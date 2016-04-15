import {Observable} from 'rx'
const {of} = Observable

import ComingSoon from 'components/ComingSoon'
import {TabbedPage} from 'components/ui'

import Priority from './Priority'
import Commitments from './Commitments'
const More = ComingSoon('More Info')

export default sources => ({
  pageTitle: of('At a Glance'),

  ...TabbedPage({...sources,
    tabs$: of([
      {path: '/', label: 'Priority'},
      {path: '/commitments', label: 'Commitments'},
      // {path: '/more', label: 'More'},
    ]),
    routes$: of({
      '/': Priority,
      '/commitments': Commitments,
      '/more': More,
    }),
  }),
})
