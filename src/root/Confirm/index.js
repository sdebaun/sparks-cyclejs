import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import {div, img} from 'cycle-snabbdom'
import {Spinner, Input, Col, Row, Button} from 'snabbdom-material'

import AppBar from 'components/AppBar'

function confimUser([formData, auth]) {
  const {provider, uid} = auth
  const {profileImageURL, fullName: fallBack} = auth[provider]
  const {email, fullName = fallBack} = formData
  const payload = {
    fullName, email, uid, profileImageURL,
    isConfirmed: true,
    isAdmin: false,
  }
  return Observable.merge(
    Observable.just({domain: 'Users', action: 'create', uid, payload: {uid}}),
    Observable.just({domain: 'Profiles', action: 'create', uid, payload})
  )
}

const formStyle = {
  margin: '0 auto',
  marginTop: '5em',
  textAlign: 'center',
  width: '100%',
  maxWidth: '800px',
}

const imgStyle = {
  height: '128px',
  width: '128px',
}

const _renderForm = auth => {
  if (!auth) { return div({},'') }
  const {provider} = auth
  const {email, displayName, profileImageURL} = auth[provider]
  return div({style: formStyle}, [
    Row({}, [
      Col({type: 'md-2'}, [
        img({style: imgStyle, attrs: {src: profileImageURL}}),
      ]),
      Col({type: 'md-10'}, [
        Input({label: 'Full Name', className: 'fullName', value: displayName}),
      ]),
    ]),
    Row({}, [
      Col({type: 'md-2'}),
      Col({type: 'md-10'}, [
        Input({label: 'E-Mail', className: 'email', value: email}),
      ]),
    ]),
    Row({}, [
      Button({primary: true, className: 'submit', onClick: () => {}}, [
        'Confirm this is you',
      ]),
    ]),
  ])
}

const _DOM = ({auth, appBar}) =>
  div({}, [
    appBar,
    div({style: {display: 'flex', justifyContent: 'center'}}, [
      _renderForm(auth),
    ]),
  ])

export default sources => {
  const {auth$} = sources

  const appBar = AppBar({...sources, hideMenu$: Observable.just(true)})

  const fullName$ = sources.DOM.select('.fullName input').observable
    .filter(([elm]) => !!elm)
    .map(([elm]) => elm.value)

  const email$ = sources.DOM.select('.email').events('input')
    .pluck('target', 'value')

  const formData$ = combineLatestObj({fullName$, email$})
    .sample(sources.DOM.select('.submit').events('click'))

  const DOM =
    combineLatestObj({
      auth$,
      appBar: appBar.DOM,
    }).map(_DOM).startWith(Spinner({size: 100}))

  const route$ = Observable.merge(
    appBar.route$, sources.redirectLogin$, sources.redirectLogout$
  )
  // const route$ = sources.userProfile$
  //   .filter(profile => !!profile)
  //   .map(profile => profile.isAdmin ? '/admin' : '/dash')
  //   .merge(appBar.route$)
  //   .merge(sources.auth$.filter(auth => !auth).map('/'))

  const queue$ = formData$.withLatestFrom(sources.auth$).flatMap(confimUser)

  return {DOM, route$, queue$, auth$: appBar.auth$}
}
