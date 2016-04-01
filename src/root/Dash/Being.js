import {h, ul} from 'cycle-snabbdom'
import {Observable} from 'rx'
const {combineLatest, of} = Observable
import isolate from '@cycle/isolate'
import {div} from 'helpers'
// import {RaisedButton} from 'components/sdm'
import {LargeProfileAvatar} from 'components/profile'
import {TextAreaControl} from 'components/sdm/TextAreaControl'
import {
  ListItemCollapsibleTextArea,
} from 'components/sdm'

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
  // const editProfileButton = RaisedButton({...sources,
  //     label$: of('Edit Profile'),
  //   })

  const DOM = combineLatest(
      largeProfileAvatar.DOM,
      profileInfo.DOM,
      // editProfileButton.DOM,
      (...doms) => div({},doms),
    )

  return {DOM}
}

const Intro = sources => {
  const introText = TextAreaControl(sources)
  const DOM = introText.DOM
    .map(intro =>
      div({}, [
        h('p', {},`
          Give people a quick glimpse of how awesome you are.
          This is the first thing they see on your applications.
        `),
        intro,
      ])
    )

  return {DOM}
}

const DescriptionTextarea = sources => ListItemCollapsibleTextArea({
  ...sources,
  title$: of('Introduce Yourself!'),
  subtitle$: of(`
    Give people a quick glimpse of how awesome you are.
    This is the first thing they see on your applications.
  `),
  iconName$: of('playlist_add'),
  okLabel$: of('yes do it'),
  cancelLabel$: of('wait a sec'),
})

export default sources => {
  const profile = Profile(sources)
  const intro = Intro(sources)
  const DOM = combineLatest(
    profile.DOM,
    intro.DOM,
    (...doms) => div({},doms)
  )

  const descriptionTextarea = isolate(DescriptionTextarea)({...sources,
    value$: sources.project$.pluck('description'),
  })

  return {
    DOM: descriptionTextarea.DOM,
  }
}
