import {Observable} from 'rx'
import isolate from '@cycle/isolate'
import combineLatestObj from 'rx-combine-latest-obj'
import {col} from 'helpers'
import listItem from 'helpers/listItem'

import makeTextareaListItem from 'components/TextareaListItemFactory'

import {Opps} from 'remote'

const _render = ({textareaQuestionDOM}) =>
  col(
    // togglePublicDOM,
    textareaQuestionDOM,
    listItem({
      iconName: 'playlist_add',
      title: 'Apply to Teams.',
      subtitle: 'Coming Soon!',
      disabled: true,
    }),
  )

const TextareaQuestion = makeTextareaListItem({
  iconName: 'playlist_add',
  title: 'You can ask people one special question when they apply.',
})

export default sources => {
  const textareaQuestion = isolate(TextareaQuestion)({
    value$: sources.opp$.pluck('question'),
    ...sources,
  })

  const updateQuestion$ = textareaQuestion.value$
    .withLatestFrom(sources.oppKey$, (question,key) =>
      Opps.update(key,{question})
    )

  const queue$ = Observable.merge(
    updateQuestion$,
  )

  const viewState = {
    textareaQuestionDOM: textareaQuestion.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)
  return {
    DOM,
    queue$,
  }
}
