import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'cycle-snabbdom'

import ProjectForm from 'components/ProjectForm'

import listItem from 'helpers/listItem'

// import {log} from 'util'

// TODO: move to helpers
const rows = obj =>
  Object.keys(obj).map(k => ({$key: k, ...obj[k]}))

const _renderProjects = projects =>
  rows(projects).map(({name,$key}) =>
    listItem(
      {title: name, subtitle: 'project',
      link: '/project/' + $key, className: 'project'}
    )
  )

const _DOM = ({projects, formDOM}) =>
  div({}, [
    formDOM,
    div({attrs: {class: 'projects'}}, _renderProjects(projects)),
  ])

import {Projects} from 'remote'

export default sources => {
  const projects$ = sources.firebase('Projects')
    .map(p => p || {})

  const projectForm = ProjectForm(sources)

  const newProject$ = projectForm.project$
    .filter(p => p !== {})
    .map(Projects.create)

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
