// WIP extracting remote data interface
import {rows, byMatch} from 'util'

/*
exports what are essentially namespaced components
or mutators that are used by other components to translate intent
into other things:

ACTIONS - are functions that map payloads to actions

Profiles:
  action:
    create: actionCreator('Profiles','create')

can then be used as

const newProfile$ = ...from component logic
const queue$ = newProfile$.map(Profiles.action.create)

and the queue$ is returned as a sink back up to the driver which processes it.

QUERIES - return parameterized streams of remote data state

Projects:
  query:
    byOwner: filterBy('Projects', 'ownerProfileKey')

  const myProjects$ = currentUserProfileKey$
    .flatMapLatest(Projects.query.byOwner(sources))

myProjects$ is now a stream
each emit consisting of an array of all the user's projects
*/

const filterAll = collection => sources => () =>
  sources.firebase(collection)
    .map(rows)

const filterBy = (collection, orderByChild) => sources => equalTo =>
  sources.firebase(collection, {orderByChild, equalTo})
    .map(rows)

const filterOne = collection => sources => key =>
  sources.firebase(collection,key)

const responseRedirect = (collection, action, routeMapper) => sources => ({
  route$: sources.responses$
    .filter(byMatch(collection, action))
    .map(response => routeMapper(response.payload)),
})

const actionCreator = (domain, action) => payload => ({
  domain,
  action,
  payload,
})

export const Profiles = {
  query: {
    one: filterOne('Profiles'),
  },
  action: {
    create: actionCreator('Profiles', 'create'),
    update: actionCreator('Profiles', 'update'),
  },
}

export const Projects = {
  query: {
    one: filterOne('Projects'),
    all: filterAll('Projects'),
    byOwner: filterBy('Projects', 'ownerProfileKey'),
  },
  action: {
    create: actionCreator('Projects', 'create'),
    update: actionCreator('Projects', 'update'),
    remove: actionCreator('Projects', 'remove'),
  },
  redirect: {
    create: responseRedirect('Projects', 'create', key => '/project/' + key),
  },
}

export const ProjectImages = {
  query: {
    one: filterOne('ProjectImages'),
  },
  action: {
    set: actionCreator('ProjectImages', 'set'),
  },
}

export const TeamImages = {
  query: {
    one: filterOne('TeamImages'),
  },
  action: {
    set: actionCreator('TeamImages', 'set'),
  },
}

export const Engagements = {
  query: {
    all: filterAll('Engagements'),
    one: filterOne('Engagements'),
    byUser: filterBy('Engagements','profileKey'),
    byOpp: filterBy('Engagements','oppKey'),
  },
  action: {
    create: actionCreator('Engagements', 'create'),
    update: actionCreator('Engagements', 'update'),
    remove: actionCreator('Engagements', 'remove'),
  },
}

export const Commitments = {
  query: {
    byOpp: filterBy('Commitments','oppKey'),
  },
  action: {
    create: actionCreator('Commitments', 'create'),
    update: actionCreator('Commitments', 'update'),
    remove: actionCreator('Commitments', 'remove'),
  },
}

export const Teams = {
  query: {
    one: filterOne('Teams'),
    byProject: filterBy('Teams','projectKey'),
  },
  action: {
    create: actionCreator('Teams', 'create'),
    update: actionCreator('Teams', 'update'),
    remove: actionCreator('Teams', 'remove'),
  },
}

export const Opps = {
  query: {
    one: filterOne('Opps'),
    byProject: filterBy('Opps','projectKey'),
  },
  action: {
    create: actionCreator('Opps', 'create'),
    remove: actionCreator('Opps', 'remove'),
    update: actionCreator('Opps', 'update'),
  },
}

export const Organizers = {
  query: {
    one: filterOne('Organizers'),
    byProject: filterBy('Organizers','projectKey'),
    byUser: filterBy('Organizers','profileKey'),
  },
  action: {
    create: actionCreator('Organizers', 'create'),
    remove: actionCreator('Organizers', 'remove'),
  },
}

export const Fulfillers = {
  query: {
    byTeam: filterBy('Fulfillers','teamKey'),
    byOpp: filterBy('Fulfillers','oppKey'),
  },
  action: {
    create: actionCreator('Fulfillers', 'create'),
    remove: actionCreator('Fulfillers', 'delete'), // CHANGE
  },
}

export const Memberships = {
  query: {
    byTeam: filterBy('Memberships','teamKey'),
    byOpp: filterBy('Memberships','profileKey'),
    byEngagement: filterBy('Memberships','engagementKey'),
  },
  action: {
    create: actionCreator('Memberships', 'create'),
    remove: actionCreator('Memberships', 'remove'),
    update: actionCreator('Memberships', 'update'),
  },
}

export const Shifts = {
  query: {
    one: filterOne('Shifts'),
    byTeam: filterBy('Shifts', 'teamKey'),
  },
  action: {
    create: actionCreator('Shifts', 'create'),
    update: actionCreator('Shifts', 'update'),
    remove: actionCreator('Shifts', 'remove'),
  },
}

export const Assignments = {
  query: {
    one: filterOne('Assignments'),
    byOwner: filterBy('Assignments', 'profileKey'),
    byTeam: filterBy('Assignments', 'teamKey'),
    byShift: filterBy('Assignments', 'shiftKey'),
  },
  action: {
    create: actionCreator('Assignments', 'create'),
    update: actionCreator('Assignments', 'update'),
    remove: actionCreator('Assignments', 'remove'),
  },
}
