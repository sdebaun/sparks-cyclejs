import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import ProjectForm from 'components/ProjectForm'

import {col, importantTip, pageTitle} from 'helpers'

import {Projects} from 'remote'

const _render = ({userProfile, projectFormDOM}) =>
  col(
    importantTip('The Sparks.Network is not open to the public right now.'),
    `
    We are currently working with our Early Access Partners before our public launch.
    Go ahead and create a project if you'd like to explore,
    but you won't be able to start recruiting unless you're part of our EAP.
    If you'd like to be part of our Early Access Program, contact us below!
    `,
    projectFormDOM,
  )

const _redirectResponses = ({responses$}) => responses$
  .filter(({domain,event}) => domain === 'Projects' && event === 'create')
  .map(response => '/project/' + response.payload)

export default sources => {
  const project$ = Observable.just({})

  const projectForm = ProjectForm({project$, ...sources})

  const newProject$ = projectForm.project$
    .filter(p => p !== {})

  const queue$ = newProject$.map(Projects.create)

  const route$ = _redirectResponses(sources)

  // const redirectOnCreate$ = sources.responses$
  //   .filter(({domain,event}) => domain === 'Projects' && event === 'create')
  //   .map(response => '/project/' + response.payload)

  const DOM = combineLatestObj({
    thing$: Observable.just(null),
    projectFormDOM$: projectForm.DOM,
  }).map(_render)

  return {
    DOM,
    route$,
    queue$,
  }
}
