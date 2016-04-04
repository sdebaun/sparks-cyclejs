import {Observable} from 'rx'
const {of} = Observable

import {TabbedPage} from 'components/ui'

import AnswerQuestion from './AnswerQuestion'
import ChooseTeams from './ChooseTeams'
import NextSteps from './NextSteps'

export default sources => ({
  pageTitle: of('Your Application'),

  ...TabbedPage({...sources,
    tabs$: of([
      {path: '/', label: 'Next Steps'},
      {path: '/question', label: 'Answer Question'},
      {path: '/teams', label: 'Choose Teams'},
    ]),
    routes$: of({
      '/': NextSteps,
      '/question': AnswerQuestion,
      '/teams': ChooseTeams,
    }),
  }),
})
