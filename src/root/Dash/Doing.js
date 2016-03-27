import {Observable} from 'rx'
const {just, combineLatest} = Observable

import combineLatestObj from 'rx-combine-latest-obj'
import isolate from '@cycle/isolate'

import {col, div, importantTip} from 'helpers'
import listItem from 'helpers/listItem'

import {Projects, Engagements} from 'components/remote'

import {ProjectItem, ProjectForm} from 'components/project'
import {EngagementItem} from 'components/engagement'

import {
  List,
  ListItemCollapsible,
  RaisedButton,
  FlatButton,
  Dialog,
} from 'components/sdm'

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
    projectFormDOM,
  )

const ProjectOwnedItem = sources => ProjectItem({...sources,
  subtitle$: just('owner'),
})

const CreateProjectListItem = sources => {
  const createBtn = RaisedButton({...sources,
    label$: just('Start a Project Anyway'),
  })

  const cancelBtn = FlatButton({...sources,
    label$: just('Nevermind'),
  })

  const form = ProjectForm(sources)

  const dialog = Dialog({...sources,
    titleDOM$: just('Create Project'),
    iconName$: just('sitemap'),
    contentDOM$: form.DOM,
    isOpen$: createBtn.click$.map(true),
  })

  const contentDOM$ = combineLatest(
    dialog.DOM,
    createBtn.DOM,
    cancelBtn.DOM,
    (dialogDOM, ...buttonsDOM) =>
      div({},[
        div({},[`
          Before our public launch, we are inviting Early Access Partners
          to try out the Sparks.Network.  You are welcome to create a project,
          but you'll only be able to start recruiting volunteers if you're
          an Early Access Partner.
        `]),
        div({}, buttonsDOM),
        dialogDOM,
      ])
  )

  const li = ListItemCollapsible({...sources,
    title$: just('Start your own project'),
    iconName$: just('sitemap'),
    contentDOM$,
    isOpen$: cancelBtn.click$.map(false),
  })

  return {
    DOM: li.DOM,
    project$: form.project$,
  }
}

const Welcome = sources => ({
  DOM: combineLatest(
    sources.projects$, sources.engagements$,
    (p,e) => p.length === 0 && e.length === 0
  ).map(show => show &&
    div({},`
    Welcome to the Sparks.Network!
    During our Beta, there are only a limited number opportunities,
    but anyone can apply.
    `)
  ),
})

export default sources => {
  const projects$ = sources.userProfileKey$
    .flatMapLatest(Projects.query.byOwner(sources))

  const engagements$ = sources.userProfileKey$
    .flatMapLatest(Engagements.query.byUser(sources))

  const create = isolate(CreateProjectListItem,'create')(sources)

  const projectList = isolate(List)({...sources,
    Control$: just(ProjectOwnedItem),
    rows$: projects$,
  })

  const engagementList = isolate(List)({...sources,
    Control$: just(EngagementItem),
    rows$: engagements$,
  })

  const queue$ = create.project$
    .map(Projects.action.create)

  const route$ = Observable.merge(
    projectList.route$,
    engagementList.route$,
    Projects.redirect.create(sources).route$,
  )

  const viewState = {
    projectListDOM$: projectList.DOM,
    projectFormDOM$: create.DOM,
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
