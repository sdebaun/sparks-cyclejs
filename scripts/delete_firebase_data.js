/* eslint-disable */
var Firebase = require('firebase')

var collections = [
  'Assignments',
  'Commitments',
  'Engagements',
  'Fulfillers',
  'Memberships',
  'Opps',
  'Organizers',
  'Projects',
  'ProjectImages',
  'Profiles',
  'Shifts',
  'Teams',
  'TeamImages',
  'Users'
]

var fb = new Firebase('https://sparks-circleci.firebaseio.com')

fb.authWithCustomToken('8au0xiGv3fnbvkfVXdArNGIrNssKfB19NoDnlIaD', (err, auth) => {
  if (err) {
    console.log('FB auth err:',err); process.exit()
  } else {
    console.log('FB authed successfully')
  }
})

collections.forEach(c => {
  fb.child(c).remove()
})
