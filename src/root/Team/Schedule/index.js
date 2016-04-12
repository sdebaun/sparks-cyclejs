import {Observable} from 'rx'
const {of} = Observable

import ComingSoon from 'components/ComingSoon'
import {TabbedPage} from 'components/ui'

const Overview = ComingSoon('Overview')

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
