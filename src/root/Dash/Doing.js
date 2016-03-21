import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import isolate from '@cycle/isolate'

import ProjectForm from 'components/ProjectForm'

import {col, importantTip} from 'helpers'
// import listHeader from 'helpers/listHeader'
import listItem from 'helpers/listItem'

import {Projects} from 'remote'

import {rows} from 'util'

const _renderProjects = projectRows => [
  projectRows.length > 0 ?
    listItem({title: 'Projects You Manage', header: true}) :
    null,
  ...projectRows.map(({name,$key}) =>
    listItem(
      {title: name, subtitle: 'project',
      link: '/project/' + $key, className: 'project'}
    )
  ),
]

const _label = ({isApplied, isAccepted, isConfirmed}) =>
  isConfirmed && 'Confirmed' ||
    isAccepted && 'Accepted' ||
      isApplied && 'Applied' ||
        'Unknown'

const _renderEngagements = (title, engagementRows) => [
  engagementRows.length > 0 ? listItem({title, header: true}) : null,
  ...engagementRows.map(({oppKey, $key, ...props}) =>
    listItem(
      {title: oppKey, subtitle: _label(props),
      link: '/engaged/' + $key, className: 'project'}
    )
  ),
]

const _render = ({projectRows, projectFormDOM, engagementRows}) =>
  col(
    importantTip('The Sparks.Network is not open to the public right now.'),
    `
    We are currently working with our Early Access Partners
    before our public launch.
    Go ahead and create a project if you'd like to explore,
    but you won't be able to start recruiting unless you're part of our EAP.
    If you'd like to be part of our Early Access Program, contact us below!
    `,
    projectFormDOM,
    ..._renderProjects(projectRows),
    ..._renderEngagements('Applied To',
      engagementRows
        .filter(e => e.isApplied && !e.isAccepted && !e.isConfirmed),
    ),
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

  const projectRows$ = projects$.map(rows)

  const engagements$ = sources.userProfileKey$
    .flatMapLatest(profileKey => sources.firebase('Engagements',{
      orderByChild: 'profileKey', equalTo: profileKey,
    }))

  const engagementRows$ = engagements$.map(rows)

  const projectForm = isolate(ProjectForm)({project$, ...sources})

  const newProject$ = projectForm.project$
    .filter(p => p !== {})

  const queue$ = newProject$.map(Projects.create)

  const nav$ = sources.DOM.select('.project').events('click')
    .map(e => e.ownerTarget.dataset.link)

  const redirect$ = _redirectResponses(sources)

  const route$ = Observable.merge(nav$, redirect$)

  const viewState = {
    projectRows$,
    projectFormDOM$: projectForm.DOM,
    engagementRows$,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {
    DOM,
    route$,
    queue$,
  }
}
