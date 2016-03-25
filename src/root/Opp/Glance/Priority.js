// import {ListItemClickable} from 'components/sdm'

// const DoAThing = sources => ListItemClickable({
//   title$: just('do a thing'),
// })

// const priorityList = sources => [
//   sources.commitments$.map(c => DoAThing(sources)),
// ].filter(i => !!i)

// export default sources => {
//   const createOrganizerInvite = isolate(CreateOrganizerInvite)(sources)
//   const createTeam = isolate(CreateTeam)(sources)
//   const createOpp = isolate(CreateOppListItem)(sources)

//   const queue$ = Observable.merge(
//     createOrganizerInvite.queue$,
//     createTeam.queue$,
//     createOpp.queue$,
//   )

//   const route$ = _responseRedirects$(sources)
//     .merge(
//       sources.DOM.select('.clickable').events('click') // omg brilliant +1
//         .filter(e => !!e.ownerTarget.dataset.link)
//         .map(e => e.ownerTarget.dataset.link)
//     )

//   const viewState = {
//     project$: sources.project$,
//     projectImage$: sources.projectImage$.startWith(null),
//     teams$: sources.teams$,
//     organizers$: sources.organizers$,
//     createOrganizerInviteDOM$: createOrganizerInvite.DOM,
//     createTeamDOM$: createTeam.DOM,
//     createOppDOM$: createOpp.DOM,
//   }

//   const DOM = combineLatestObj(viewState)
//     .map(_render(sources.router.createHref))

//   return {DOM, queue$, route$}
// }
