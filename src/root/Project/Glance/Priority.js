import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'

import CreateOrganizerInvite from 'components/CreateOrganizerInvite'
import {CreateTeamListItem} from 'components/team'
import {CreateOppListItem} from 'components/opp'

import {
  ListItemNavigating,
} from 'components/sdm'

import {div} from 'helpers'

// import {log} from 'util'
import {byMatch} from 'util'

const _responseRedirects$ = ({responses$, router: {createHref}}) =>
  Observable.merge(
    responses$.filter(byMatch('Organizers','create'))
      .map(() => createHref('/manage/staff')),
    responses$.filter(byMatch('Teams','create'))
      // not createHref - /team is off root of site
      .map(response => '/team/' + response.payload),
    responses$.filter(byMatch('Opps','create'))
      // not createHref - /team is off root of site
      .map(response => '/opp/' + response.payload),
  )

const DescribePriority = sources => ListItemNavigating({...sources,
  title$: just('What\'s your project all about?'),
  iconName$: just('playlist_add'),
  path$: just(sources.router.createHref('/manage/describe')),
})

const PicturePriority = sources => ListItemNavigating({...sources,
  title$: just('Choose a photo for your project'),
  iconName$: just('add_a_photo'),
  path$: just(sources.router.createHref('/manage/describe')),
})

export default sources => {
  const describe = DescribePriority(sources)
  const picture = PicturePriority(sources)
  const invite = isolate(CreateOrganizerInvite)(sources)
  const team = isolate(CreateTeamListItem)(sources)
  const opp = isolate(CreateOppListItem)(sources)

  const queue$ = Observable.merge(
    invite.queue$,
    team.queue$,
    opp.queue$,
  )

  const route$ = merge(
    _responseRedirects$(sources),
    sources.DOM.select('.clickable').events('click') // omg brilliant +1
      .filter(e => !!e.ownerTarget.dataset.link)
      .map(e => e.ownerTarget.dataset.link),
    describe.route$,
    picture.route$,
  )

  const priorityDOMs = [
    describe.DOM,
    picture.DOM,
    invite.DOM,
    team.DOM,
    opp.DOM,
  ].filter(i => !!i)

  const DOM = combineLatest(
    ...priorityDOMs,
    (...doms) => div({}, doms)
  )

  return {DOM, queue$, route$}
}
