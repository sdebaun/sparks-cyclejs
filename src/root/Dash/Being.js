import {h, ul} from 'cycle-snabbdom'
import {Observable} from 'rx'
const {combineLatest} = Observable
import {div} from 'helpers'
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

export default sources => {
  const portraitUrl$ = sources.userProfile$
    .map(up => up && up.portraitUrl)
  const profileDOM = combineLatest(
    LargeProfileAvatar({...sources, src$: portraitUrl$}).DOM,
    ProfileInfo(sources).DOM,
    (...doms) => div({},doms),
  )
  return {
    DOM: profileDOM,
  }
}
