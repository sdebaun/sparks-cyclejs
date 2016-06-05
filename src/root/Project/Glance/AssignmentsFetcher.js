import {Observable as $} from 'rx'
import {curryN, not, compose, allPass, prop, gte, filter, path,
        map, uniq, toLower, sortBy, join, juxt, last, init,
        split} from 'ramda'

import {
  Assignments,
  Shifts,
  Profiles,
  Engagements,
  Teams,
} from 'components/remote'

import {localTime, log} from 'util'
import moment from 'moment'

const diff = start =>
  parseInt(localTime(start).diff(localTime(moment()), 'hours'))

const valueInRangeInclusive = curryN(3)((min, max, value) =>
  min <= value && value <= max)

const assignmentsRange$ = sources =>
  sources.assignments$
  .map(filter(
    allPass([
      compose(not, prop('startTime')),
      compose(
        valueInRangeInclusive(-sources.hoursAgo, sources.hoursAhead),
        diff,
        path(['shift', 'start'])
      ),
    ])
  ))
  .shareReplay(1)

const assignmentsEnding$ = sources =>
  sources.assignments$
    .map(filter(
      allPass([
        compose(Boolean, prop('startTime')),
        compose(not, prop('endTime')),
        compose(gte(sources.hoursAhead), diff, path(['shift', 'start'])),
      ])
    ))
    .shareReplay(1)

export default function AssignmentsFetcher(sources) {
  const assignmentsByOpp$ = sources.opps$
    .map(map(o => Assignments.query.byOpp(sources)(o.$key)))
    .flatMapLatest(arrayAssignQueries => $.combineLatest(arrayAssignQueries))
    .shareReplay(1)

  const assignmentsOnly$ = assignmentsByOpp$
    .map(assignments => [].concat.apply([],assignments))
    .shareReplay(1)

  const queries = map(remote => remote.query.one(sources),
    {Shifts, Profiles, Engagements, Teams})

  const assignments$ =
    assignmentsOnly$
    .map(
      compose(
        map(amnt =>
          $.combineLatest(
            queries.Shifts(amnt.shiftKey),
            queries.Profiles(amnt.profileKey),
            queries.Engagements(amnt.engagementKey),
            queries.Teams(amnt.teamKey),
            (shift, profile, engagement, team) =>
              ({...amnt, shift, profile, engagement, team})
          )
        ),
        filter(a => a.profileKey && a.shiftKey),
      )
    )
    .flatMapLatest(amntQueries => $.combineLatest(amntQueries))
  .map(amnts =>
    amnts.sort((a,b) => moment(a.shift.start) - moment(b.shift.start)))
  .shareReplay(1)

  const allProfiles$ =
    assignmentsOnly$
    .tap(log('ap'))
    .map(
      compose(
        map(queries.Profiles),
        uniq,
        map(prop('profileKey')),
        filter(prop('profileKey')),
      )
    )
    .flatMapLatest($.combineLatest)
    .map(sortBy(
      compose(
        toLower,
        join,
        juxt([last, init]),
        split(' '),
        prop('fullName')
      )
    ))
    .tap(log('ap2'))
    .shareReplay(1)

  return {
    assignments$,
    allProfiles$,
    /**
    * @param {Number} options.hoursAgo
    * @param {Number} options.hoursAhead
    */
    range: options => assignmentsRange$({...options, assignments$}),
    /**
    * @param {Number} options.hoursAhead
    */
    ending: options => assignmentsEnding$({...options, assignments$}),
  }
}
