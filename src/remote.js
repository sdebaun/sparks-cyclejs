// grow up to be remote/*.js
// constructor functions for different remote actions
// perhaps also orm-ish wrappers for dumb json objects?
// extend cyclic-fire?

export const Projects = {
  create: (payload) => ({
    domain: 'Projects',
    action: 'create',
    payload,
  }),
}

export const Organizers = {
  invite: (payload) => ({
    domain: 'Organizers',
    action: 'invite',
    payload,
  }),
}
