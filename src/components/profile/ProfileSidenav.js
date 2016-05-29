import {Observable as $} from 'rx'
import {h} from 'cycle-snabbdom'

import isolate from '@cycle/isolate'

import {SidedrawerTitle} from 'components/Title'
import {MediumProfileAvatar} from 'components/profile'

import {
  ListItem,
} from 'components/sdm'

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

import {combineDOMsToDiv} from 'util'

const _Title = sources => SidedrawerTitle({...sources,
  titleDOM$: sources.userName$,
  subtitleDOM$: $.of('Welcome'),
  leftDOM$: MediumProfileAvatar({...sources,
    profile$: sources.userProfile$,
    profileKey$: sources.userProfileKey$,
  }).DOM,
  classes$: $.of(['profile']),
})

const _Welcome = sources => ListItem({...sources,
  title$: $.just('Welcome to the Sparks.Network!'),
})

const _HelpLink = sources => isolate(ListItem)({...sources,
  title$: $.just(h('a',{
    props: {
      href: 'mailto:help@sparks.network',
    },
  },['Got questions?'])),
})

export const ProfileSidenav = sources => {
  const t = _Title(sources)
  const wel = _Welcome(sources)
  const help = _HelpLink(sources)

  // const route$ = sources.DOM.select('')
  return {
    DOM: combineDOMsToDiv('', t, wel, help),
    route$: t.route$,
  }
}
