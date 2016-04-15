// require('./styles.scss')

// import {Observable} from 'rx'
// const {just, combineLatest} = Observable

// import {img} from 'cycle-snabbdom'

// const CLASSES = {avatar: true}
// const MEDIUM = {medium: true}
// const LARGE = {large: true}

// const Avatar = sources => ({
//   DOM: combineLatest(
//     sources.classes$ || just({}),
//     sources.src$,
//     (classes, src) => img({class: {...CLASSES, ...classes}, attrs: {src}})
//   ),
// })

// const MediumAvatar = ({classes$, ...sources}) => Avatar({...sources,
//   classes$: classes$ ? classes$.map(c => ({...MEDIUM, ...c})) : just(MEDIUM),
// })

// const LargeAvatar = ({classes$, ...sources}) => Avatar({...sources,
//   classes$: classes$ ? classes$.map(c => ({...LARGE, ...c})) : just(MEDIUM),
// })

import {
  Avatar,
  MediumAvatar,
  LargeAvatar,
} from 'components/sdm'

import {
  Profiles,
} from 'components/remote'

const ProfileFetcher = sources => ({
  profile$: sources.profileKey$
    .flatMapLatest(Profiles.query.one(sources)),
})

const PortraitFetcher = sources => ({
  portraitUrl$: ProfileFetcher(sources).profile$
    .map(p => p ? p.portraitUrl : null),
})

const ProfileAvatar = sources => Avatar({...sources,
  src$: PortraitFetcher(sources).portraitUrl$,
})

const MediumProfileAvatar = sources => MediumAvatar({...sources,
  src$: PortraitFetcher(sources).portraitUrl$,
})

const LargeProfileAvatar = sources => LargeAvatar({...sources,
  src$: PortraitFetcher(sources).portraitUrl$,
})

export {
  LargeProfileAvatar,
  MediumProfileAvatar,
  ProfileAvatar,
}
