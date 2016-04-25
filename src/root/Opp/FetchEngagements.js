import {
  Engagements,
} from 'components/remote'

const filterApplied = e =>
  e.filter(x => !x.isAccepted && !x.declined && !x.isConfirmed)
const filterPriority = e =>
  e.filter(x => x.isAccepted && x.priority && !x.isConfirmed)
const filterOK = e =>
  e.filter(x => x.isAccepted && !x.priority && !x.isConfirmed)
const filterNever = e =>
  e.filter(x => !x.isAccepted && x.declined && !x.isConfirmed)
const filterConfirmed = e =>
  e.filter(x => x.isConfirmed)

export const FetchEngagements = sources => {
  const all$ = sources.oppKey$
    .flatMapLatest(Engagements.query.byOpp(sources))
    .shareReplay(1)

  const errored$ = all$
    .map(engs => engs.filter(e => !e.profileKey)) // filter out naughty records
    .subscribe(engs => console.log('Applications with errors:', engs))

  const e$ = all$
    .map(engs => engs.filter(e => !!e.profileKey)) // filter out naughty records
    .shareReplay(1)

  return {
    engagements$: e$,
    applied$: e$.map(filterApplied).shareReplay(1),
    priority$: e$.map(filterPriority).shareReplay(1),
    ok$: e$.map(filterOK).shareReplay(1),
    never$: e$.map(filterNever).shareReplay(1),
    confirmed$: e$.map(filterConfirmed).shareReplay(1),
  }
}
