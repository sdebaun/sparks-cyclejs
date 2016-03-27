import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div} from 'helpers'

import SetImage from 'components/SetImage'

// import {log} from 'util'

import {
  Projects,
  ProjectImages,
} from 'components/remote'

import {
  ListItemCollapsibleTextArea,
} from 'components/sdm'

const DescriptionTextarea = sources => ListItemCollapsibleTextArea({
  ...sources,
  title$: just('Describe this Project to the world.'),
  subtitle$: just(`
    This is shown to all the people involved in your project,
    so make it general.
  `),
  iconName$: just('playlist_add'),
  okLabel$: just('yes do it'),
  cancelLabel$: just('wait a sec'),
})

export default sources => {
  const inputDataUrl$ = sources.projectImage$
    .map(i => i && i.dataUrl)

  const setImage = SetImage({...sources, inputDataUrl$})

  const descriptionTextarea = isolate(DescriptionTextarea)({...sources,
    value$: sources.project$.pluck('description'),
  })

  const updateDescription$ = descriptionTextarea.value$
    .withLatestFrom(sources.projectKey$, (description,key) => ({
      key,
      values: {description},
    }))
    .map(Projects.action.update)

  const setImage$ = setImage.dataUrl$
    .withLatestFrom(
      sources.projectKey$,
      (dataUrl,key) => ({key, values: {dataUrl}})
    )
    .map(ProjectImages.action.set)

  const queue$ = merge(updateDescription$, setImage$)

  const DOM = combineLatest(
    descriptionTextarea.DOM,
    setImage.DOM,
    (...doms) => div({},doms)
  )
  return {
    DOM,
    queue$,
  }
}
