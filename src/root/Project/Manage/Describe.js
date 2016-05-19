import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable
import {complement, identity} from 'ramda'

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
  value$: sources.project$.pluck('description'),
  iconName$: just('playlist_add'),
  okLabel$: just('yes do it'),
  cancelLabel$: just('wait a sec'),
})

export default sources => {
  const inputDataUrl$ = sources.projectImage$
    .map(i => i && i.dataUrl)

  const setImage = SetImage({...sources, inputDataUrl$})

  const descriptionTextarea = isolate(DescriptionTextarea)(sources)

  const updateDescription$ = descriptionTextarea.value$
    .withLatestFrom(sources.projectKey$, (description,key) => ({
      key,
      values: {description},
    }))
    .map(Projects.action.update)

  const setImage$ = setImage.dataUrl$
    .filter(identity)
    .withLatestFrom(sources.projectKey$, (dataUrl, key) =>
      ProjectImages.action.set({key, values: {dataUrl}}))

  const removeImage$ = setImage.dataUrl$
    .filter(complement(identity))
    .withLatestFrom(sources.projectKey$, (dataUrl, key) =>
      ProjectImages.action.remove(key))

  const queue$ = merge(updateDescription$, setImage$, removeImage$)

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
