import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {div,a} from 'cycle-snabbdom'

import ProjectForm from 'components/ProjectForm'

import {log} from 'helpers'

// TODO: move to helpers/dom
const rows = obj =>
  Object.keys(obj).map(k => ({$key: k, ...obj[k]}))

const renderProjects = projects =>
  rows(projects).map(({name,$key}) =>
    div({attrs: {class: 'project', 'data-link': '/project/' + $key}}, [name]))

const _DOM = ({projects, formDOM}) =>
  div({}, [
    formDOM,
    div({attrs: {class: 'projects'}},renderProjects(projects)),
  ])

import actions from 'helpers/actions'

export default sources => {
  const projects$ = sources.firebase('Projects')
    .map(p => p || {})

  const projectForm = ProjectForm(sources)

  const newProject$ = projectForm.project$
    .filter(p => p !== {})
    .map(actions.Projects.create)

  const nav$ = sources.DOM.select('.projects .project').events('click')
    .map(e => e.ownerTarget.dataset.link)

  const redirectOnCreate$ = sources.responses$
    .filter(({domain,event}) => domain === 'Projects' && event === 'create')
    .map(response => '/project/' + response.payload)

  const route$ = Observable.merge(nav$, redirectOnCreate$)

  const DOM = combineLatestObj({projects$, formDOM$: projectForm.DOM}).map(_DOM)

  return {
    DOM,
    queue$: newProject$,
    route$,
  }
}
