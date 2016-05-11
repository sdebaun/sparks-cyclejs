import {Observable as $} from 'rx'
// const {just, merge, combineLatest} = Observable

// import {log} from 'util'

import {combineDOMsToDiv} from 'util'

import {LargeCard} from 'components/sdm'

// const _label = ({isApplied, isAccepted, isConfirmed}) =>
//   isConfirmed && 'Confirmed' ||
//     isAccepted && 'Accepted' ||
//       isApplied && 'Applied' ||
//         'Unknown'

// const _Fetch = sources => {
//   const projects$ = sources.userProfileKey$
//     .flatMapLatest(Projects.query.byOwner(sources))

//   const engagements$ = sources.userProfileKey$
//     .flatMapLatest(Engagements.query.byUser(sources))
//     .shareReplay(1)

//   const acceptedEngagements$ = engagements$
//     .map(engagements => engagements.filter(e => !!e.isAccepted))

//   const organizers$ = sources.userProfileKey$
//     .flatMapLatest(Organizers.query.byUser(sources))

//   return {
//     projects$,
//     engagements$,
//     organizers$,
//     acceptedEngagements$,
//   }
// }

// const hideable = Control => sources => {
//   const ctrl = Control(sources)
//   const {DOM, ...sinks} = ctrl
//   return {
//     DOM: sources.isVisible$.flatMapLatest(v => v ? DOM : $.just(null)),
//     ...sinks,
//   }
// }

// const _EngagementFetcher = sources => {
//   const opp$ = sources.item$.pluck('oppKey')
//     .flatMapLatest(Opps.query.one(sources))
//   const projectKey$ = opp$.pluck('projectKey')
//   const project$ = projectKey$
//     .flatMapLatest(Projects.query.one(sources))
//   const projectImage$ = projectKey$
//     .flatMapLatest(ProjectImages.query.one(sources))

//   return {
//     opp$,
//     projectKey$,
//     project$,
//     projectImage$,
//   }
// }

// const EngagedCard = sources => {
//   const _sources = {...sources, ..._EngagementFetcher(sources)}

//   return NavigatingComplexCard({..._sources,
//     src$: _sources.projectImage$.map(p => p && p.dataUrl || null),
//     title$: _sources.project$.pluck('name'),
//     // subtitle$: opp$.pluck('name'),
//     subtitle$: $.combineLatest(
//       _sources.opp$.pluck('name'),
//       _sources.item$,
//       (name, item) => `${name} | ${_label(item)}`
//     ),
//     path$: _sources.item$.map(({$key}) => `/engaged/${$key}`),
//   })
// }

// const EngagedList = sources => PartialList({...sources,
//   rows$: sources.engagements$,
//   Control$: $.just(EngagedCard),
// })

// const ManagedCard = sources => NavigatingComplexCard({...sources,
//   title$: sources.item$.pluck('name'),
//   subtitle$: $.just('Owner'),
//   path$: sources.item$.map(({$key}) => `/project/${$key}`),
// })

// const ManagedList = sources => PartialList({...sources,
//   rows$: sources.projects$,
//   Control$: $.just(ManagedCard),
// })

// const ConfirmListItem = sources => {
//   const _sources = {...sources, ..._EngagementFetcher(sources)}
//   return ListItemNavigating({..._sources,
//     leftDOM$: ProjectAvatar(_sources).DOM,
//     title$: _sources.project$.pluck('name'),
//     subtitle$: _sources.opp$.map(({name}) => `${name} | Accepted`),
//     path$: _sources.item$.map(({$key}) => `/engaged/${$key}/schedule`),
//   })
// }

// const ConfirmationsList = sources => PartialList({...sources,
//   rows$: sources.acceptedEngagements$,
//   Control$: $.just(ConfirmListItem),
// })

// const ConfirmationsNeededCard = sources => {
//   const list = ConfirmationsList(sources)
//   const contents$ = list.contents$
//     .map(contents => [
//      'You\'ve been approved for these opportunities. ' +
//      'Confirm now to lock in your spot!', ...contents]
//      )
//   const card = hideable(TitledCard)({...sources,
//     elevation$: $.just(2),
//     isVisible$: sources.acceptedEngagements$.map(c => c.length > 0),
//     content$: contents$,
//     title$: $.just('Confirm Your Spot!'),
//   })
//   return {
//     ...card,
//     route$: list.route$,
//   }
// }

/*
import PickTeams from '../OldApplication/ChooseTeams'

const PTCard = sources => {
  const aq = PickTeams(sources)
  return {
    ...TitledCard({...sources,
      content$: $.just([aq.DOM]),
    }),
    route$: aq.route$,
    queue$: aq.queue$,
  }
}

/*
const PickTeamsCard = sources => PTCard({...sources,
  elevation$: $.just(2),
  // isVisible$: sources.engagement$.map(e => e.isApplied && !e.isAccepted),
  title$: $.just('Choose Some Teams'),
})

import AnswerQuestion from '../OldApplication/AnswerQuestion'

const AQCard = sources => {
  const aq = AnswerQuestion(sources)
  return {
    ...TitledCard({...sources,
      content$: $.just([aq.DOM]),
    }),
    route$: aq.route$,
    queue$: aq.queue$,
  }
}

const ApplicationQCard = sources => AQCard({...sources,
  elevation$: $.just(2),
  // isVisible$: sources.engagement$.map(e => e.isApplied && !e.isAccepted),
  title$: $.just('Answer the Question'),
})

const CombinedList = sources => ({
  DOM: sources.contents$.map(contents => div('.cardcontainer',contents)),
})
*/

// const CardList = sources => {
//   const teams = PickTeamsCard(sources)
//   const app = ApplicationQCard(sources)
//   // const conf = ConfirmationsNeededCard(sources)
//   // const managed = ManagedList(sources)
//   // const engaged = EngagedList(sources)

//   const contents$ = $.combineLatest(
//     teams.DOM,
//     app.DOM,
//     // conf.DOM,
//     // managed.contents$,
//     // engaged.contents$,
//     (c, a) => [c, a]
//     // (w, c, m, e) => [w, c, ...m, ...e]
//   )

//   return {
//     ...CombinedList({...sources,
//       contents$,
//     }),
//     route$: $.merge(teams.route$, app.route$),
//     queue$: $.merge(teams.queue$, app.queue$),
//     // route$: $.merge(managed.route$, engaged.route$, conf.route$),
//   }
// }

// const CardList = sources => ({DOM: $.just(div([]))})

// export default sources => {
//   // const _sources = {...sources, ..._Fetch(sources)}
//   const cards = CardList(sources)

//   return {
//     DOM: cards.DOM,
//     route$: cards.route$,
//   }
// }
import {TitleListItem} from 'components/ui'

const _Title = sources => TitleListItem({...sources,
  title$: sources.engagement$.map(({isAccepted}) =>
    isAccepted ? 'Application Accepted' : 'Your Application'
  ),
})

import {Step1} from './Step1'
import {Step2} from './Step2'

export default sources => {
  const t = _Title(sources)
  const s1 = Step1(sources)
  const s2 = Step2(sources)
  // const aq = AnswerQuestion(sources)
  // const pt = PickTeams(sources)

  const card = LargeCard({...sources,
    content$: $.combineLatest(t.DOM, s1.DOM, s2.DOM),
  })

  return {
    DOM: combineDOMsToDiv('.cardcontainer',card),
    queue$: $.merge(s1.queue$, s2.queue$),
    route$: $.merge(s2.route$),
  }
}
