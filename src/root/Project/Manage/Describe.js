import {Observable} from 'rx'
const {just, combineLatest} = Observable

import isolate from '@cycle/isolate'

import SetImage from 'components/SetImage'
import {ProjectImages} from 'components/remote'

import {div} from 'helpers'

// import {log} from 'util'

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

  const description = isolate(DescriptionTextarea)({...sources,
    value$: sources.project$.pluck('description'),
  })

  const queue$ = setImage.dataUrl$
    .withLatestFrom(
      sources.projectKey$,
      (dataUrl,key) => ({key, values: {dataUrl}})
    )
    .map(ProjectImages.action.set)

  const DOM = combineLatest(
    description.DOM,
    setImage.DOM,
    (...doms) => div({},doms)
  )
  return {
    DOM,
    queue$,
  }
}
