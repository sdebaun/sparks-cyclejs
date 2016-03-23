import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import isolate from '@cycle/isolate'

import listItem from 'helpers/listItem'
// import listHeader from 'helpers/listHeader'

import {h, div} from 'cycle-snabbdom'

import {rows} from 'util'
// import {log} from 'util'

import {CreateTeamHeader} from 'components/team'
import {CreateOppHeader} from 'components/opp'

const _navActions = sources => Observable.merge(
  sources.DOM.select('.navAction').events('click')
    .map(e => e.ownerTarget.dataset.link),
  sources.DOM.select('.project.glance').events('click')
    .map(e => '/team/' + e.ownerTarget.dataset.key),
  sources.DOM.select('.team').events('click')
    .map(e => '/team/' + e.ownerTarget.dataset.key),
  sources.DOM.select('.opp').events('click')
    .map(e => '/opp/' + e.ownerTarget.dataset.key),
)

const _teamItems = _rows =>
  _rows.map(({name, $key}) =>
    listItem({title: name, className: 'team', key: $key})
  )

const _oppItems = _rows =>
  _rows.map(({name, $key}) =>
    listItem({title: name, className: 'opp', key: $key})
  )

const _render = ({
  isMobile,
  teams,
  opps,
  titleDOM,
  teamListHeaderDOM,
  oppListHeaderDOM,
  createHref,
}) => {
  const teamRows = rows(teams)
  const oppRows = rows(opps)
  return div(
    {},
    [
      isMobile ? null : titleDOM,
      h('div.rowwrap', {style: {padding: '0px 15px'}}, [
        listItem({
          title: 'At a Glance',
          iconName: 'home',
          link: createHref('/'),
          className: 'navAction',
        }),
        listItem({
          title: 'Manage',
          iconName: 'settings',
          link: createHref('/manage'),
          className: 'navAction',
        }),
        teamRows.length > 0 ? teamListHeaderDOM : null,
        ..._teamItems(teamRows),
        oppRows.length > 0 ? oppListHeaderDOM : null,
        ..._oppItems(oppRows),
      ]),
    ]
  )
}

const ProjectNav = sources => {
  const route$ = _navActions(sources)

  const teamListHeader = isolate(CreateTeamHeader)(sources)
  const oppListHeader = isolate(CreateOppHeader)(sources)

  const queue$ = Observable.merge(
    teamListHeader.queue$,
    oppListHeader.queue$,
  )

  const viewState$ = {
    isMobile$: sources.isMobile$,
    teamListHeaderDOM$: teamListHeader.DOM,
    oppListHeaderDOM$: oppListHeader.DOM,
    teams$: sources.teams$,
    opps$: sources.opps$,
    titleDOM$: sources.titleDOM,
    createHref$: Observable.just(sources.router.createHref),
  }

  const DOM = combineLatestObj(viewState$).map(_render)

  return {DOM, route$, queue$}
}

export {ProjectNav}
