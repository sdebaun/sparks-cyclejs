// WIP extracting remote data fetching and parsing to wrap in convenience methods
import {rows, byMatch} from 'util'

const filterAll = collection => sources => () =>
  sources.firebase(collection)
    .map(rows)

const filterBy = (collection, orderByChild) => sources => equalTo =>
  sources.firebase(collection, {orderByChild, equalTo})
    .map(rows)

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

export const Engagements = {
  query: {
    all: filterAll('Engagements'),
    byUser: filterBy('Engagements','profileKey'),
  },
}
