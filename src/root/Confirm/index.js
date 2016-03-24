import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
// import isolate from '@cycle/isolate'

// import {log} from 'util'

// import AppBar from 'components/AppBar'

// import {div} from 'cycle-snabbdom'

/*
thoughts on connecting forms to actions
we want to be able to easily write domain-specific form components
e.g. ProjectForm, ProfileForm

we want our form components to be as agnostic as possible about
how their output is used by the rest of the application
eg consume a sources.project$ or sources.profile$
so that they can be used for editing or creating
and then should simply pass the changed domain object as a sink
and let the parent do what they need to do with it

const AdminDashPage = sources =>{
  // initialize the form with a blank object or whatever
  const newProjectForm = ProjectForm({project$:Observable.just({}),...sources})
  return {
    // any changes come down the pipe and get transformed by the action creator
    queue$: newProjectForm.project$.map(actions.Projects.create)
  }
}

const ProjectEditPage = sources =>{
  // sources already contains project$ from routing
  const editProjectForm = ProjectForm(sources)
  return {
    // any changes transformed by update action creator
    queue$: editProjectForm.project$.map(actions.Projects.update)
  }
}
*/

import {Profiles} from 'remote'

import SoloFrame from 'components/SoloFrame'
import {ProfileForm} from 'components/ProfileForm'
import {narrowCol, pageTitle} from 'helpers'
import {submitAndCancel} from 'helpers/buttons'

// import {log} from 'util'

const _fromGoogleData =
  ({uid, google: {displayName, email, profileImageURL}}) => ({
    uid,
    fullName: displayName,
    email,
    portraitUrl: profileImageURL,
  })

const _fromFacebookData =
  ({uid, facebook: {displayName, email, profileImageURL}}) => ({
    uid,
    fullName: displayName,
    email,
    portraitUrl: profileImageURL,
  })

const _fromAuthData$ = sources =>
  sources.auth$.filter(a => !!a).map(({provider, ...auth}) =>
    provider === 'google' && _fromGoogleData(auth) ||
    provider === 'facebook' && _fromFacebookData(auth)
  )

const _submitAction$ = ({DOM}) =>
  DOM.select('.submit').events('click').map(true)

const _render = ({valid, profileFormDOM}) =>
  narrowCol(
    pageTitle('Is This You?'),
    profileFormDOM,
    valid ? submitAndCancel('yup, that\'s me!', 'let me log in again') : null
  )

export default sources => {
  const authProfile$ = _fromAuthData$(sources)

  const profileForm = ProfileForm({item$: authProfile$, ...sources})
  // const profileForm = isolate(ProfileForm,'confirm-profile-form')(sources)

  const submit$ = _submitAction$(sources)

  const profile$ = profileForm.item$

  const valid$ = profile$
    .map(({fullName,email,phone}) =>
      !!fullName && !!email && !!phone
    )

  const queue$ = profile$
    .sample(submit$)
    .map(Profiles.create)

  const viewState = {
    valid$,
    auth$: sources.auth$,
    userProfile$: sources.userProfile$,
    profileFormDOM$: profileForm.DOM,
  }

  const pageDOM = combineLatestObj(viewState).map(_render)

  const frame = SoloFrame({pageDOM, ...sources})

  const redirectLogin$ = sources.previousRoute$
    .sample(sources.redirectLogin$)
    .map(r => r || '/dash')

  const redirectLogout$ = sources.previousRoute$
    .sample(sources.redirectLogout$)
    .map(r => r || '/')

  const route$ = Observable.merge(
    frame.route$,
    redirectLogin$,
    redirectLogout$,
  )

  const auth$ = frame.auth$

  const DOM = frame.DOM

  return {DOM, route$, queue$, auth$}
}
