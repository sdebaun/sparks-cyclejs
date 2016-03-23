// WIP extracting remote data interface
import {rows, byMatch} from 'util'

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

export const Projects = {
  query: {
    one: filterOne('Projects'),
    all: filterAll('Projects'),
    byOwner: filterBy('Projects', 'ownerProfileKey'),
  },
  action: {
    create: actionCreator('Projects', 'create'),
  },
  redirect: {
    create: responseRedirect('Projects', 'create', key => '/project/' + key),
  },
}

export const ProjectImages = {
  query: {
    one: filterOne('ProjectImages'),
  },
}

export const Engagements = {
  query: {
    all: filterAll('Engagements'),
    byUser: filterBy('Engagements','profileKey'),
  },
}

export const Commitments = {
  query: {
    byOpp: filterBy('Commitments','oppKey'),
  },
  action: {
    create: actionCreator('Commitments', 'create'),
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
  },
}

export const Organizers = {
  query: {
    byProject: filterBy('Organizers','projectKey'),
  },
  action: {
    create: actionCreator('Organizers', 'create'),
    remove: actionCreator('Organizers', 'remove'),
  },
}
