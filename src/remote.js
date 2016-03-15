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
    action: 'set',
    payload: {key, values},
  }),
}
