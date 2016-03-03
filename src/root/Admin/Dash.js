import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'cycle-snabbdom'

import ProjectForm from 'components/ProjectForm'

// TODO: move to helpers/dom
const rows = obj =>
  Object.keys(obj).map(k => ({$key: k, ...obj[k]}))

const renderProjects = projects =>
  rows(projects).map(({name}) => div({}, [name]))

const _DOM = ({projects, formDOM}) =>
  div({}, [
    formDOM,
    div({},renderProjects(projects)),
  ])

export default sources => {
  const projects$ = sources.firebase('Projects')
    .startWith([])

  const projectForm = ProjectForm(sources)

  const newProject$ = Observable.combineLatest(
      sources.auth$, projectForm.project$,
      (auth, project) => ({...project, uid: auth && auth.uid})
    )

  const redirectOnCreate$ = sources.responses$
    .filter(({domain,event}) => domain === 'Projects' && event === 'create')
    .subscribe(x => console.log('redirect',x))

  const DOM = combineLatestObj({projects$, formDOM$: projectForm.DOM}).map(_DOM)

  return {
    DOM,
    queue$: newProject$,
  }
}
