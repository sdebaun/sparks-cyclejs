import {Observable} from 'rx'
import ComingSoon from 'components/ComingSoon'
import {div} from 'cycle-snabbdom'
import {Form,Input,Button} from 'snabbdom-material'

import ProjectForm from 'components/ProjectForm'

// TODO: move to helpers/dom
const rows = obj =>
  Object.keys(obj).map(k => ({$key: k, ...obj[k]}))

const renderProjects = projects =>
  rows(projects).map(({name}) => div({}, [name]))

const DOM = props$ =>
  props$.map(({projects, formDOM}) =>
    div({}, [
      formDOM,
      div({},renderProjects(projects)),
    ])
  )

// alt:
// const DOM = ({projects, formDOM}) =>
//   div({}, [
//     formDOM,
//     div({},renderProjects(projects)),
//   ])

export default sources => {
  const projects$ = sources.firebase('Projects')
    .startWith([])

  const projectForm = ProjectForm(sources)

  const newProject$ = Observable.combineLatest(
      sources.auth$, projectForm.project$,
      (auth, project) => ({...project, uid: auth && auth.uid})
    )

  // alt:
  // const DOM = viewProps$.map(_render)
  const viewProps$ = Observable.combineLatest(
    projects$, projectForm.DOM,
    (projects, formDOM) => ({projects, formDOM})
  )

  return {
    DOM: DOM(viewProps$),
    queue$: newProject$,
  }
}
