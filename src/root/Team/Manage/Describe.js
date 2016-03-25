import {Observable} from 'rx'
const {just, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div} from 'helpers'

import SetImage from 'components/SetImage'

import {
  ListItemCollapsibleTextArea,
} from 'components/sdm'

import {Teams, TeamImages} from 'components/remote'

const TextareaDescription = sources => ListItemCollapsibleTextArea({
  ...sources,
  title$: just('Write a short tweet-length description'),
  iconName$: just('playlist_add'),
  okLabel$: just('this sounds great'),
  cancelLabel$: just('hang on ill do this later'),
})

export default sources => {
  const setImage = SetImage({...sources,
    image$: sources.teamImage$,
    aspectRatio$: just(1),
  })

  const setImage$ = setImage.dataUrl$
    .withLatestFrom(
      sources.teamKey$,
      (dataUrl,key) => ({key, values: {dataUrl}})
    )
    .map(TeamImages.action.set)

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
    setImage$,
  )

  const DOM = combineLatest(
    textareaDescription.DOM,
    setImage.DOM,
    (...doms) => div({},doms)
  )

  return {
    DOM,
    queue$,
  }
}
