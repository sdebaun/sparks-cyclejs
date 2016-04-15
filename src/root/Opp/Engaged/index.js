import {Observable} from 'rx'
const {of} = Observable

import {TabbedPage} from 'components/ui'

import Applied from './Applied'

export default sources => ({
  pageTitle: of('Engaged Volunteers'),

  ...TabbedPage({...sources,
    tabs$: of([
      {path: '/', label: 'Applied'},
      // {path: '/applied', label: 'Applied'},
      // {path: '/accepted', label: 'Accepted'},
    ]),
    routes$: of({
      '/': Applied,
      // '/applied': Applied,
      // '/accepted': Accepted,
    }),
  }),
})
