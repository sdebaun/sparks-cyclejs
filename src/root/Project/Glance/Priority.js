import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import isolate from '@cycle/isolate'

import CreateOrganizerInvite from 'components/CreateOrganizerInvite'
import CreateTeam from 'components/CreateTeam'
import CreateOpp from 'components/CreateOpp'

import listItem from 'helpers/listItem'
import listItemDisabled from 'helpers/listItemDisabled'

import {col} from 'helpers'

// import {log} from 'util'
import {rows, byMatch} from 'util'

const _render = (createHref) => ({
  projectImage,
  teams,
  organizers,
  createOrganizerInviteDOM,
  createTeamDOM,
  createOppDOM,
}) =>
    col(
      listItemDisabled({
        iconName: 'playlist_add',
        title: 'What\'s your project all about?',
      }),
      rows(teams).length === 0 ? createTeamDOM : null,
      rows(organizers).length === 0 ? createOrganizerInviteDOM : null,
      createOppDOM,
      !projectImage && listItem({
        iconName: 'add_a_photo',
        iconBackgroundColor: 'yellow',
        title: 'Choose a photo for your project',
        link: createHref('/manage/describe'),
      }),
      listItem({
        iconName: 'balance-scale',
        iconBackgroundColor: 'yellow',
        title: 'What\'s the Enery Exchange you\'re offering your volunteers?',
        link: createHref('/manage/exchange'),
      })
    )

const _responseRedirects$ = ({responses$, router: {createHref}}) =>
  Observable.merge(
    responses$.filter(byMatch('Organizers','create'))
      .map(() => createHref('/staff')),
    responses$.filter(byMatch('Teams','create'))
      // not createHref - /team is off root of site
      .map(response => '/team/' + response.payload),
    responses$.filter(byMatch('Opps','create'))
      // not createHref - /team is off root of site
      .map(response => '/opp/' + response.payload),
  )

export default sources => {
  const createOrganizerInvite = isolate(CreateOrganizerInvite)(sources)
  const createTeam = isolate(CreateTeam)(sources)
  const createOpp = isolate(CreateOpp)(sources)

  const queue$ = Observable.merge(
    createOrganizerInvite.queue$,
    createTeam.queue$,
    createOpp.queue$,
  )

  const route$ = _responseRedirects$(sources)
    .merge(
      sources.DOM.select('.clickable').events('click') // omg brilliant +1
        .filter(e => !!e.ownerTarget.dataset.link)
        .map(e => e.ownerTarget.dataset.link)
    )

  const viewState = {
    project$: sources.project$,
    projectImage$: sources.projectImage$.startWith(null),
    teams$: sources.teams$,
    organizers$: sources.organizers$,
    createOrganizerInviteDOM$: createOrganizerInvite.DOM,
    createTeamDOM$: createTeam.DOM,
    createOppDOM$: createOpp.DOM,
  }

  const DOM = combineLatestObj(viewState)
    .map(_render(sources.router.createHref))

  return {DOM, queue$, route$}
}
