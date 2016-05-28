import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import {identity} from 'ramda'
// import isolate from '@cycle/isolate'

import {Profiles} from 'remote'

import SoloFrame from 'components/SoloFrame'
import {ProfileForm} from 'components/ProfileForm'
import {pageTitle} from 'helpers'
import {submitAndCancel} from 'helpers/buttons'

import {LargeAvatar} from 'components/sdm'

import {div} from 'helpers'

// import {log} from 'util'

const _fromGoogleData =
  ({uid, displayName, email, photoURL}) => ({
    uid,
    fullName: displayName,
    email,
    portraitUrl: photoURL,
  })

const _fromFacebookData =
  ({uid, displayName, email, profileImageURL}) => ({
    uid,
    fullName: displayName,
    email,
    portraitUrl: profileImageURL,
  })

const fromProviderData = ({providerId, ...data}) => ({ // eslint-disable-line no-extra-parens,max-len
  'google.com': _fromGoogleData,
  'facebook.com': _fromFacebookData
}[providerId](data))

const _fromAuthData$ = sources =>
  sources.auth$.filter(identity)
    .map(fromProviderData)

const _submitAction$ = ({DOM}) =>
  DOM.select('.submit').events('click').map(true)

// const _render = ({valid, profileFormDOM, portraitDOM}) =>
//   narrowCol(
//     pageTitle('Is This You?'),
//     portraitDOM,
//     profileFormDOM,
//     valid ? submitAndCancel('yup, that\'s me!', 'let me log in again') : null
//   )

export default sources => {
  const authProfile$ = _fromAuthData$(sources)

  const portraitUrl$ = authProfile$.pluck('portraitUrl')

  const pic = LargeAvatar({...sources,
    src$: portraitUrl$,
  })

  const profileForm = ProfileForm({item$: authProfile$, ...sources})

  const submit$ = _submitAction$(sources)

  const profile$ = profileForm.item$
    .combineLatest(
      portraitUrl$,
      (p,portraitUrl) => ({...p, portraitUrl})
    )

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
    portraitDOM$: pic.DOM,
    profileFormDOM$: profileForm.DOM,
  }

  const pageDOM = combineLatestObj(viewState)
    .map(({valid, profileFormDOM, portraitDOM}) =>
      div('.narrow', [
      // narrowCol(
        div('.row', [
          div('.col-xs-12.col-sm-6.center',[pageTitle('Is This You?')]),
          div('.col-xs-12.col-sm-6.center',[portraitDOM]),
        ]),
        profileFormDOM,
        valid ?
          submitAndCancel('yup, that\'s me!', 'let me log in again') :
          null,
      ].filter(identity))
    )

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
