import {Observable as $} from 'rx'
import {curryN, not, compose, allPass, prop, gte, filter, path,
        map, uniq, toLower, sortBy, join, juxt, last, init,
        split, identity, applySpec, propEq, find} from 'ramda'

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

const hasProfileAndShiftKeyΩ = allPass([
  prop('profileKey'),
  prop('shiftKey'),
])

const fullNameToSortName = compose(
  join(' '),
  juxt([last, init]),
  split(' '))

const sortBySurname = sortBy(
  compose(
    toLower,
    fullNameToSortName,
    prop('fullName')
  ))

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

const assignmentsLate$ = sources =>
  sources.assignments$
    .map(amnts =>
      amnts.filter(a => !a.startTime && diff(a.shift.start) < 0)
    )
    .shareReplay(1)

const fetchAllChildren = sources => assignments$ =>
  assignments$.map(
    compose(
      map(assignment =>
        $.combineLatest(
          Shifts.query.one(sources)(assignment.shiftKey),
          Profiles.query.one(sources)(assignment.profileKey),
          Engagements.query.one(sources)(assignment.engagementKey),
          Teams.query.one(sources)(assignment.teamKey),
          (shift, profile, engagement, team) =>
            ({...assignment, shift, profile, engagement, team})
        )
      ),
      filter(hasProfileAndShiftKeyΩ),
    )
  )
  .flatMapLatest($.combineLatest)

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
    .map(
      applySpec({
        profileQueries: compose(
          map(queries.Profiles),
          uniq,
          map(prop('profileKey')),
          filter(prop('profileKey')),
        ),
        assignments: identity,
      })
    )
    .flatMapLatest(spec =>
      $.combineLatest(spec.profileQueries)
      .map(
        map(profile =>
          ({
            ...profile,
            assignments: filter(
              propEq('profileKey', profile.$key),
              spec.assignments,
            ),
          })
        )
      )
    )
    .map(sortBySurname)
    .tap(log('ap2'))
    .shareReplay(1)

  const profilesWithArrival$ = $.combineLatest(
      allProfiles$,
      sources.arrivals$.tap(log('arr')),
      (profiles, arrivals) => map(profile =>
        ({
          ...profile,
          arrival: find(propEq('profileKey', profile.$key))(arrivals),
        }))(profiles))
    .tap(log('ap3'))
    .shareReplay(1)

  return {
    assignments$,
    allProfiles$,
    profilesWithArrival$,
    /**
    * @param {Number} options.hoursAgo
    * @param {Number} options.hoursAhead
    */
    range: options => assignmentsRange$({...options, assignments$}),
    /**
    * @param {Number} options.hoursAhead
    */
    ending: options => assignmentsEnding$({...options, assignments$}),
    /**
    *
    */
    late: () => assignmentsLate$({assignments$}),
    /**
    * @param {Observable<Array>} sources.assignments$
    */
    fetchAllChildren: fetchAllChildren(sources),
  }
}
