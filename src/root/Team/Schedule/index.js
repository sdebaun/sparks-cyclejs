import {Observable} from 'rx'
const {of} = Observable

import {TabbedPage} from 'components/ui'
import Overview from './Overview'

export default sources => ({
  pageTitle: of('Schedule'),

  ...TabbedPage({...sources,
    tabs$: of([
      {path: '/', label: 'Overview'},
    ]),
    routes$: of({
      '/': Overview,
    }),
  }),
})
