import {Observable} from 'rx'
import {div, h1, h2, h3, h4, h5, ul, li, a, b, br} from 'cycle-snabbdom'

import AppIconMenu from './AppIconMenu'
import HeaderLogo from './HeaderLogo'

const renderHook = (appIcon, headerLogo) =>
  div('#hook', {}, [
    div('.row', {}, [
      appIcon,
      headerLogo,
    ]),
    h1('.container', {}, 'Doing is living.'),
  ])

const renderBenefits = () =>
  div('#benefits', {static: true}, [
    div('.container', {}, [
      h3({}, ['Get invited to volunteer opportunities from all ' +
        'over the world by joining the ', b('sparks.network')]),
      ul({}, [
        li('.sn-icon.flag', {}, [
          b({}, 'Have new experiences'),
          ' by participating in lots of different events.',
        ]),
        li('.sn-icon.mountains', {}, [
          b({}, 'Get rewarded'),
          ' by the people you help with cool gifts and perks.',
        ]),
        li('.sn-icon.first', {}, [
          b({}, 'Be recognized'),
          'for your contributions with Karma, Accomplishments, an Triumphs.',
        ]),
      ]),
    ]),
  ])

const basicLink = (title, href = '') =>
  a({props: {href}}, [title])

const renderFooter = () =>
  div('#footer', {static: true}, [
    div('.links.container', {}, [
      div({}, [
        h5({}, 'Contact'),
        ul({}, [
          li({}, [basicLink('Support')]),
          li({}, [basicLink('Business')]),
          li({}, [basicLink('Press')]),
          li({}, [
            basicLink('Info', 'mailto:info@sparks.network'),
          ]),
        ]),
      ]),
      div({}, [
        h5({}, 'About'),
        ul({}, [
          li({}, [basicLink('Mission')]),
          li({}, [basicLink('Now Hiring')]),
          li({}, [basicLink('Our Team')]),
        ]),
      ]),
      div({}, [
        h5({}, 'News'),
        ul({}, [
          li({}, [basicLink('Blog')]),
          li({}, [basicLink('Facebook')]),
          li({}, [basicLink('Twitter')]),
        ]),
      ]),
      div('.container', {
        hook: {
          insert({elm}) {
            elm.innerHTML = '&copy; 2016 Sparks.Network'
          },
        },
      }),
    ]),
  ])

export default (sources) => {
  const appIconMenu = AppIconMenu(sources)
  const headerLogo = HeaderLogo(sources)

  const view =
    div('#landing', {}, [
      renderHook(appIconMenu.DOM, headerLogo.DOM),
      div('#promise', {static: true}, [
        h2('.container', {}, 'Get Involved Now!'),
      ]),
      div('#more-heart', {static: true}),
      renderBenefits(),
      div('#cta', {static: true}, [
        div('.container', {}, [
          h4({}, ['Sign Up For', br({}), 'The Sparks Network!']),
        ]),
      ]),
      renderFooter(),
    ])

  return {
    DOM: Observable.just(view),
  }
}
