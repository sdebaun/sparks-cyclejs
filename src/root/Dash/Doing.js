import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import isolate from '@cycle/isolate'

import ProjectForm from 'components/ProjectForm'

import {col, importantTip, pageTitle} from 'helpers'
import listHeader from 'helpers/listHeader'
import listItem from 'helpers/listItem'

import {Projects} from 'remote'

import {rows} from 'util'

const _renderProjects = projects =>
  rows(projects).map(({name,$key}) =>
    // div({attrs: {class: 'project', 'data-link': '/project/' + $key}}, [name]))
    listItem({title: name, subtitle: 'project', link: '/project/' + $key, className: 'project'})
  )

const _render = ({projects, projectFormDOM}) =>
  col(
    importantTip('The Sparks.Network is not open to the public right now.'),
    `
    We are currently working with our Early Access Partners before our public launch.
    Go ahead and create a project if you'd like to explore,
    but you won't be able to start recruiting unless you're part of our EAP.
    If you'd like to be part of our Early Access Program, contact us below!
    `,
    projectFormDOM,
    ..._renderProjects(projects),
  )

const _redirectResponses = ({responses$}) => responses$
  .filter(({domain,event}) => domain === 'Projects' && event === 'create')
  .map(response => '/project/' + response.payload)

export default sources => {
  const project$ = Observable.just({})
  const projects$ = sources.userProfileKey$
    .flatMapLatest(profileKey => sources.firebase('Projects',{
      orderByChild: 'ownerProfileKey', equalTo: profileKey,
    }))

  const projectForm = isolate(ProjectForm)({project$, ...sources})

  const newProject$ = projectForm.project$
    .filter(p => p !== {})

  const queue$ = newProject$.map(Projects.create)

  const nav$ = sources.DOM.select('.project').events('click')
    .map(e => e.ownerTarget.dataset.link)

  const redirect$ = _redirectResponses(sources)

  const route$ = Observable.merge(nav$, redirect$)

  const DOM = combineLatestObj({
    projects$,
    projectFormDOM$: projectForm.DOM,
  }).map(_render)

  return {
    DOM,
    route$,
    queue$,
  }
}
