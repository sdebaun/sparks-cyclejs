// import {ProjectItem} from 'components/project'

// const _label = ({isApplied, isAccepted, isConfirmed}) =>
//   isConfirmed && 'Confirmed' ||
//     isAccepted && 'Accepted' ||
//       isApplied && 'Applied' ||
//         'Unknown'

// const OrganizerItem = sources => ProjectItem({...sources,
//   subtitle$: sources.item$.map(e => e.opp.name + ' | ' + _label(e)),
//   item$: sources.item$
//    .map(e => ({$key: e.opp.projectKey, ...e.opp.project})),
//   path$: sources.item$.map(({$key}) => '/engaged/' + $key),
// })

// export {OrganizerItem}
