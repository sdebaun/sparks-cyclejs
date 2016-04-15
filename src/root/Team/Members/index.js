import {Observable} from 'rx'
const {of} = Observable

import {TabbedPage} from 'components/ui'

import Applied from './Applied'

export default sources => ({
  pageTitle: of('Team Members'),

  ...TabbedPage({...sources,
    tabs$: of([
      {path: '/', label: 'Applied'},
      // {path: '/applied', label: 'Applied'},
      // {path: '/approved', label: 'Approved'},
    ]),
    routes$: of({
      '/': Applied,
      // '/applied': Applied,
      // '/approved': Approved,
    }),
  }),
})
