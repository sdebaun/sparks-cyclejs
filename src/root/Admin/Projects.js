import {Observable} from 'rx'
const {just} = Observable

import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'cycle-snabbdom'

import {Projects} from 'components/remote'
import {List} from 'components/sdm'
import {ProjectItem, ProjectForm} from 'components/project'

// import {log} from 'util'

export default sources => {
  const projects$ = Projects.query.all(sources)()

  const projectForm = ProjectForm(sources)
  const projectList = List({...sources,
    Control$: just(ProjectItem),
    rows$: projects$,
  })

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
