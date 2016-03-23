import {Observable} from 'rx'

import combineLatestObj from 'rx-combine-latest-obj'
import isolate from '@cycle/isolate'

import {col, importantTip} from 'helpers'
import listItem from 'helpers/listItem'

import {NavClicker} from 'components'
import {Projects, Engagements} from 'components/remote'
import {ProjectList, ProjectForm} from 'components/project'
import {EngagementList} from 'components/engagement'

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

const _render = ({projects, projectListDOM, projectFormDOM, engagements, engagementListDOM}) =>
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
    projects.length > 0 ?
      listItem({title: 'Projects You Manage', header: true}) :
      null,
    projectListDOM,
    engagements.length > 0 ? listItem({title: 'Applied To', header: true}) : null,
    engagementListDOM,
    // ..._renderEngagements('Applied To',
    //   engagements
    //     .filter(e => e.isApplied && !e.isAccepted && !e.isConfirmed),
    // ),
  )

export default sources => {
  const projects$ = sources.userProfileKey$
    .flatMapLatest(Projects.query.byOwner(sources))

  const engagements$ = sources.userProfileKey$
    .flatMapLatest(Engagements.query.byUser(sources))

  const projectForm = isolate(ProjectForm)(sources)
  const projectList = isolate(ProjectList)({...sources, projects$})

  const engagementList = isolate(EngagementList)({...sources, engagements$})

  const queue$ = projectForm.project$
    .map(Projects.action.create)

  const route$ = Observable.merge(
    projectList.route$,
    engagementList.route$,
    NavClicker(sources).route$,
    Projects.redirect.create(sources).route$,
  )

  const viewState = {
    projectListDOM$: projectList.DOM,
    projectFormDOM$: projectForm.DOM,
    engagementListDOM$: engagementList.DOM,
    projects$,
    engagements$,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {
    DOM,
    route$,
    queue$,
  }
}
