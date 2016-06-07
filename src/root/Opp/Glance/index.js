import {Observable} from 'rx'
const {of} = Observable

//import ComingSoon from 'components/ComingSoon'
import {TabbedPage} from 'components/ui'

import Priority from './Priority'
import Print from './PrintableShifts'
//const Find = ComingSoon('Opp | Glance | Find')
//const Recently = ComingSoon('Opp | Glance | Recently')

export default sources => ({
  pageTitle: of('At a Glance'),

  ...TabbedPage({...sources,
    tabs$: of([
      {path: '/', label: 'Priority'},
      {path: '/print', label: 'Print'},
      // {path: '/find', label: 'Find'},
      // {path: '/recently', label: 'Recently'},
    ]),
    routes$: of({
      '/': Priority,
      '/print': Print,
    }),
  }),
})
