import {Observable as $} from 'rx'

import {SidedrawerTitle} from 'components/Title'
import {MediumProfileAvatar} from 'components/profile'

// const _Nav = sources => ({
//   DOM: sources.isMobile$.map(m => m ? null : sources.titleDOM),
// })

// const _Page = sources => TabbedPage({...sources,
//   tabs$: of([
//     {path: '/', label: 'Doing'},
//     {path: '/being', label: 'Being'},
//   ]),
//   routes$: of({
//     '/': Doing,
//     '/being': Being,
//   }),
// })

const _Title = sources => SidedrawerTitle({...sources,
  titleDOM$: sources.userName$,
  subtitleDOM$: $.of('Welcome'),
  leftDOM$: MediumProfileAvatar({...sources,
    profileKey$: sources.userProfileKey$,
  }).DOM,
  classes$: $.of(['profile']),
})

export const ProfileSidenav = sources => {
  const route$ = sources.DOM.select('')
  return new _Title(sources)
}
