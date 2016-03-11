import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import AppBar from 'components/AppBar'

import {div} from 'cycle-snabbdom'

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
// function confimUser([formData, auth]) {
//   const {provider, uid} = auth
//   const {profileImageURL, fullName: fallBack} = auth[provider]
//   const {email, fullName = fallBack} = formData
//   const payload = {
//     fullName, email, uid, profileImageURL,
//     isConfirmed: true,
//     isAdmin: false,
//   }
//   return Observable.merge(
//     Observable.just({domain: 'Users', action: 'create', uid, payload: {uid}}),
//     Observable.just({domain: 'Profiles', action: 'create', uid, payload})
//   )
// }

// const formStyle = {
//   margin: '0 auto',
//   marginTop: '5em',
//   textAlign: 'center',
//   width: '100%',
//   maxWidth: '800px',
// }

// const imgStyle = {
//   height: '128px',
//   width: '128px',
// }

// const _renderForm = auth => {
//   if (!auth) { return div({},'') }
//   const {provider} = auth
//   const {email, displayName, profileImageURL} = auth[provider]
//   return div({style: formStyle}, [
//     Row({}, [
//       Col({type: 'md-2'}, [
//         img({style: imgStyle, attrs: {src: profileImageURL}}),
//       ]),
//       Col({type: 'md-10'}, [
//         Input({label: 'Full Name', className: 'fullName', value: displayName}),
//       ]),
//     ]),
//     Row({}, [
//       Col({type: 'md-2'}),
//       Col({type: 'md-10'}, [
//         Input({label: 'E-Mail', className: 'email', value: email}),
//       ]),
//     ]),
//     Row({}, [
//       Button({primary: true, className: 'submit', onClick: () => {}}, [
//         'Confirm this is you',
//       ]),
//     ]),
//   ])
// }

// const _DOM = ({auth, appBar}) =>
//   div({}, [
//     appBar,
//     div({style: {display: 'flex', justifyContent: 'center'}}, [
//       _renderForm(auth),
//     ]),
//   ])

import SoloFrame from 'components/SoloFrame'

const _render = () =>
  div({},['confirm page'])

export default sources => {
  const viewState = {
    auth$: sources.auth$,
    userProfile$: sources.userProfile$,
  }

  const pageDOM = combineLatestObj(viewState).map(_render)

  const frame = SoloFrame({pageDOM, ...sources})

  // const {auth$} = sources

  // const fullName$ = sources.DOM.select('.fullName input').observable
  //   .filter(([elm]) => !!elm)
  //   .map(([elm]) => elm.value)

  // const email$ = sources.DOM.select('.email').events('input')
  //   .pluck('target', 'value')

  // const formData$ = combineLatestObj({fullName$, email$})
  //   .sample(sources.DOM.select('.submit').events('click'))

  // const DOM =
  //   combineLatestObj({
  //     auth$,
  //     appBar: appBar.DOM,
  //   }).map(_DOM).startWith(Spinner({size: 100}))

  const route$ = Observable.merge(
    frame.route$, sources.redirectLogin$, sources.redirectLogout$
  )

  const queue$ = Observable.empty()

  const auth$ = frame.auth$

  const DOM = frame.DOM
  // const queue$ = formData$.withLatestFrom(sources.auth$).flatMap(confimUser)

  return {DOM, route$, queue$, auth$}
}
