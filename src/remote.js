// grow up to be remote/*.js
// constructor functions for different remote actions
// perhaps also orm-ish wrappers for dumb json objects?
// extend cyclic-fire?

export const Profiles = {
  create: (payload) => ({
    domain: 'Profiles',
    action: 'create',
    payload,
  }),
}

export const ProjectImages = {
  set: (key, values) => {
    return {
      domain: 'ProjectImages',
      action: 'set',
      payload: {key, values},
    }
  },
}

export const Projects = {
  create: (payload) => ({
    domain: 'Projects',
    action: 'create',
    payload,
  }),
}

export const Organizers = {
  create: (payload) => ({
    domain: 'Organizers',
    action: 'create',
    payload,
  }),
}

export const Teams = {
  create: (payload) => ({
    domain: 'Teams',
    action: 'create',
    payload,
  }),
}

export const Opps = {
  create: (payload) => ({
    domain: 'Opps',
    action: 'create',
    payload,
  }),
  update: (key, values) => ({
    domain: 'Opps',
    action: 'update',
    payload: {key, values},
  }),
}

// Fulfiller
// links a specific opp and team
// indicates that opp provisos fulfilled by shifts on team
export const Fulfillers = {
  create: (values) => ({
    domain: 'Opps',
    action: 'create',
    payload: values,
  }),
  update: (key, values) => ({
    domain: 'Opps',
    action: 'update',
    payload: {key, values},
  }),
  delete: (key) => ({
    domain: 'Opps',
    action: 'delete',
    payload: key,
  }),
}

// Proviso
// for a specific opportunity
// wot the project or volunteer is delivering to fulfill their commitment
// has a 'party' field that designates project or volunteer
// has a 'code' field that says what kind it is (shifts, deposit, etc)

// Engagement
// relates a volunteer profile to an opportunity
// comes in many different states - applied, priority, accepted, confirmed
