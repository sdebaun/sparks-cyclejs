import {Observable as $} from 'rx'

import {
  StepListItem,
} from 'components/ui'

import AnswerQuestion from './AnswerQuestion'

export const Step1 = sources => {
  const aq = AnswerQuestion(sources)

  const li = StepListItem({...sources,
    title$: $.just('Step 1: Answer the Question'),
    contentDOM$: aq.DOM,
    isOpen$: sources.engagement$.map(({answer}) => !answer),
  })

  return {
    ...li,
    queue$: aq.queue$,
  }
}
