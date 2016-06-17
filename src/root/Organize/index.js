import {Observable as $} from 'rx'
const just = $.just
import combineLatestObj from 'rx-combine-latest-obj'

// import isolate from '@cycle/isolate'

// import {log} from 'util'

// import AppBar from 'components/AppBar'

import {h5, a} from 'cycle-snabbdom'
import {div} from 'cycle-snabbdom'
import {prop, objOf, complement, equals, merge} from 'ramda'

import SoloFrame from 'components/SoloFrame'

import {
  LoginButtons,
  QuotingListItem,
} from 'components/ui'

import {RaisedButton} from 'components/sdm'

import Title from 'components/Title'
// import {log} from 'util'

import {
  Organizers,
  Projects,
  ProjectImages,
  Profiles,
} from 'components/remote'

const _Fetch = sources => {
  const organizer$ = sources.organizerKey$
    .flatMapLatest(Organizers.query.one(sources))
    .shareReplay(1)

  const project$ = organizer$
    .map(prop('projectKey'))
    .flatMapLatest(Projects.query.one(sources))
    .shareReplay(1)

  const projectImage$ = organizer$
    .map(prop('projectKey'))
    .flatMapLatest(ProjectImages.query.one(sources))
    .shareReplay(1)

  const invitedByProfile$ = organizer$
    .map(prop('invitedByProfileKey'))
    .flatMapLatest(Profiles.query.one(sources))
    .shareReplay(1)

  return {
    ...sources,
    organizer$,
    project$,
    projectImage$,
    invitedByProfile$,
  }
}

export default _sources => {
  const sources = _Fetch(_sources)

  const title = Title({
    ...sources,
    labelText$: sources.project$.map(prop('name')),
    subLabelText$: sources.project$.map(prop('description')),
    backgroundUrl$: sources.projectImage$.map(prop('dataUrl')),
  })

  const quote = QuotingListItem({
    ...sources,
    profileKey$: sources.organizer$.map(prop('invitedByProfileKey')),
    title$: sources.organizer$.map(({authority}) =>
      `I would like you to be a ${authority} on this project!`),
  })

  const loginButtons = LoginButtons({
    ...sources,
    label$: just('Accept with {{provider}}'),
  })

  const acceptButton = RaisedButton({
    ...sources,
    label$: just('Accept'),
  })

  const queue$ = acceptButton.click$
    .flatMapLatest(() => sources.organizerKey$)
    .map(objOf('key'))
    .map(Organizers.action.accept)

  // not logged in and not accepted -> show login buttons
  // not logged in and accepted -> show already accepted
  // logged in and not accepted and email matches -> show accept button
  // logged in and not accepted and email does not match -> show cannot accept
  // logged in and accepted by you -> show already accepted, click here to view
    // project
  // logged in and accepted by other -> show already accepted

  const notLoggedin$ = sources.userProfileKey$
    .filter(complement(Boolean))

  const loggedIn$ = sources.userProfileKey$
    .flatMapLatest(key => sources.userProfile$.map(merge({key})))
    .filter(Boolean)
    .tap(u => console.log(u))

  const notAccepted$ = sources.organizer$
    .filter(complement(prop('isAccepted')))

  const accepted$ = sources.organizer$
    .filter(prop('isAccepted'))

  const emailMatches$ = $.combineLatest(
    loggedIn$.map(prop('email')),
    notAccepted$.map(prop('inviteEmail')),
    equals
  )

  const profileMatches$ = $.combineLatest(
    loggedIn$.map(prop('key')),
    accepted$.map(prop('profileKey')),
    equals
  )

  const notLoggedinNotAccepted$ = $.combineLatest(notLoggedin$, notAccepted$)
    .map(loginButtons)

  const notLoggedInAccepted$ = $.combineLatest(notLoggedin$, accepted$)
    .map({DOM: just(h5('This invite has already been accepted.'))})

  const showAccept$ = emailMatches$
    .filter(Boolean)
    .map(acceptButton)

  const notForYou$ = emailMatches$
    .filter(complement(Boolean))
    .map({DOM: just(h5('This invite is not for you.'))})

  const alreadyAccepted$ = profileMatches$
    .filter(Boolean)
    .flatMapLatest(() =>
      sources.organizer$.map(org => ({
        DOM: just(h5([
          'You\'ve accepted this invite. ',
          a({attrs: {
            href: `/project/${org.projectKey}`,
          }},
          'Check out the project.',
          ),
        ])),
      }))
    )

  const anotherAccepted$ = profileMatches$
    .filter(complement(Boolean))
    .map({DOM: just(h5('This invite has been accepted by someone else.'))})

  const button$ = $.merge(
    notLoggedinNotAccepted$,
    notLoggedInAccepted$,
    showAccept$,
    notForYou$,
    alreadyAccepted$,
    anotherAccepted$
  ).shareReplay(1)

  const pageDOM = $.combineLatest(
      title.DOM,
      quote.DOM,
      button$.map(prop('DOM'))
    )
    .map(doms => div({}, doms))

  const frame = SoloFrame({pageDOM, ...sources})

  const route$ = $.merge(
    frame.route$,
  )

  return {
    DOM: frame.DOM,
    route$,
    auth$: $.merge(
      loginButtons.auth$,
      frame.auth$,
    ),
    queue$,
  }
}
