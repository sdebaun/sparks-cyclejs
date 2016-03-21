import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'cycle-snabbdom'

import {Projects} from 'components/remote'
import ProjectForm from 'components/ProjectForm'
import {ProjectList} from 'components/projects'

import {log} from 'util'

export default sources => {
  const projects$ = Projects.query.all(sources)()
  projects$.subscribe(log('projects$'))

  const projectForm = ProjectForm(sources)
  const projectList = ProjectList({...sources, projects$})

  const queue$ = projectForm.project$
    .map(Projects.action.create)

  const route$ = Observable.merge(
    projectList.route$,
    Projects.redirect.create(sources).route$,
  )

  const viewState = {
    listDOM$: projectList.DOM,
    formDOM$: projectForm.DOM,
  }

  const DOM = combineLatestObj(viewState)
    .map(({listDOM, formDOM}) => div({},[formDOM, listDOM]))

  return {
    DOM,
    queue$,
    route$,
  }
}
