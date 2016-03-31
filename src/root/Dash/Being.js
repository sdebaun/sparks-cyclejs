import {h, ul} from 'cycle-snabbdom'
import {Observable} from 'rx'
const {combineLatest, of} = Observable
import {div} from 'helpers'
import {RaisedButton} from 'components/sdm'
import {LargeProfileAvatar} from 'components/profile'

const ProfileInfo = sources => ({
  DOM: sources.userProfile$
    .map(profile =>
    ul({}, [
      h('h4', {}, `${profile.fullName}`),
      h('p', {}, `${profile.email}`),
      h('p', {}, `${profile.phone}`),
    ])
  ),
})

const Profile = sources => {
  const portraitUrl$ = sources.userProfile$
    .map(up => up && up.portraitUrl)
  const largeProfileAvatar = LargeProfileAvatar({...sources,
    src$: portraitUrl$})
  const profileInfo = ProfileInfo(sources)
  const editProfileButton = RaisedButton({...sources,
      label$: of('Edit Profile'),
    })

  const DOM = combineLatest(
      largeProfileAvatar.DOM,
      profileInfo.DOM,
      editProfileButton.DOM,
      (...doms) => div({},doms),
    )

  return {DOM}
}

export default sources => {
  const profileDOM = Profile(sources).DOM

  return {
    DOM: profileDOM,
  }
}
