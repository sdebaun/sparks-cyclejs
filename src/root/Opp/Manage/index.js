import {Observable} from 'rx'
const {of} = Observable

import {TabbedPage} from 'components/ui'

import Describe from './Describe'
import Exchange from './Exchange'
import Applying from './Applying'

export default sources => ({
  pageTitle: of('Manage Opportunity'),

  ...TabbedPage({...sources,
    tabs$: of([
      {path: '/', label: 'Describe'},
      {path: '/exchange', label: 'Exchange'},
      {path: '/applying', label: 'Applying'},
    ]),
    routes$: of({
      '/': Describe,
      '/exchange': Exchange,
      '/applying': Applying,
    }),
  }),
})
