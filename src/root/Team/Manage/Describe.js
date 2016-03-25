import {Observable} from 'rx'
const {just} = Observable

import isolate from '@cycle/isolate'

import {
  ListItemCollapsibleTextArea,
} from 'components/sdm'

import {Teams} from 'components/remote'

const TextareaDescription = sources => ListItemCollapsibleTextArea({
  ...sources,
  title$: just('Write a short tweet-length description'),
  iconName$: just('playlist_add'),
  okLabel$: just('this sounds great'),
  cancelLabel$: just('hang on ill do this later'),
})

export default sources => {
  const textareaDescription = isolate(TextareaDescription)({...sources,
    value$: sources.team$.map(({description}) => description || ''),
  })

  const updateDescription$ = textareaDescription.value$
    .withLatestFrom(sources.teamKey$, (description,key) => ({
      key,
      values: {description},
    }))
    .map(Teams.action.update)

  const queue$ = Observable.merge(
    updateDescription$,
  )

  const DOM = textareaDescription.DOM

  return {
    DOM,
    queue$,
  }
}
