import {Observable} from 'rx'
const {just} = Observable

import combineLatestObj from 'rx-combine-latest-obj'
import isolate from '@cycle/isolate'

import {col, importantTip} from 'helpers'
import listItem from 'helpers/listItem'

import {Projects, Engagements} from 'components/remote'

import {List} from 'components/sdm'
import {ProjectItem, ProjectForm} from 'components/project'
import {EngagementItem} from 'components/engagement'

const engagementHeader = engagements =>
  engagements.length > 0 ? listItem({title: 'Applied To', header: true}) : null

const _render = ({
  projects, projectListDOM, projectFormDOM, engagements, engagementListDOM,
}) =>
  col(
    projects.length > 0 ?
      listItem({title: 'Projects You Manage', header: true}) :
      null,
    projectListDOM,
    engagementHeader(engagements),
    engagementListDOM,
    importantTip('The Sparks.Network is not open to the public right now.'),
    `
    We are currently working with our Early Access Partners
    before our public launch.
    Go ahead and create a project if you'd like to explore,
    but you won't be able to start recruiting unless you're part of our EAP.
    If you'd like to be part of our Early Access Program, contact us below!
    `,
    projectFormDOM,
  )

const ProjectOwnedItem = sources => ProjectItem({...sources,
  subtitle$: just('owner'),
})

export default sources => {
  const projects$ = sources.userProfileKey$
    .flatMapLatest(Projects.query.byOwner(sources))

  const engagements$ = sources.userProfileKey$
    .flatMapLatest(Engagements.query.byUser(sources))

  const projectForm = isolate(ProjectForm)(sources)
  const projectList = isolate(List)({...sources,
    Control$: just(ProjectOwnedItem),
    rows$: projects$,
  })

  const engagementList = isolate(List)({...sources,
    Control$: just(EngagementItem),
    rows$: engagements$,
  })

  const queue$ = projectForm.project$
    .map(Projects.action.create)

  const route$ = Observable.merge(
    projectList.route$,
    engagementList.route$,
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
