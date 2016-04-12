import {div, h1, h2, h3, h4, h5, ul, li, a, b, br} from 'cycle-snabbdom'
import {Col, Row} from 'snabbdom-material'

import {headerLogo} from './index'

const headerSrc = require('images/pitch/sparklerHeader-2048.jpg')

const iconSrcs = {
  heart: require('images/pitch/heartIcon.svg'),
  first: require('images/pitch/icon-first.svg'),
  flag: require('images/pitch/icon-flag.svg'),
  mountains: require('images/pitch/icon-mountains.svg'),
}

const benefits =
  div('#benefits', {static: true}, [
    div('.container', {}, [
      h3({}, ['Get invited to volunteer opportunities from all ' +
        'over the world by joining the ', b('sparks.network')]),
      ul({}, [
        li('.sn-icon.flag', {
          style: {backgroundImage: 'url("' + iconSrcs.flag + '")'},
        }, [
          b({}, 'Have new experiences'),
          ' by participating in lots of different events.',
        ]),
        li('.sn-icon.mountains', {
          style: {backgroundImage: 'url("' + iconSrcs.mountains + '")'},
        }, [
          b({}, 'Get rewarded'),
          ' for the help that you give' +
          'with perks and access to new opportunities.',
        ]),
        li('.sn-icon.first', {
          style: {backgroundImage: 'url("' + iconSrcs.first + '")'},
        }, [
          b({}, 'Be recognized'),
          ' for your contributions with Karma, Accomplishments, and Triumphs.',
        ]),
      ]),
    ]),
  ])

const basicLink = (title, href = '') =>
  a({props: {href}, style: {color: '#FFF'}}, [title])

// const signUp = buttons =>
  // div({}, [buttons])
  // Row({style: {width: '100%', textAlign: 'center'}, className: 'signup'}, [
  //   // Col({type: 'xs-6'}, [
  //   //   Button({onClick, primary: true, className: 'facebook'}, [
  //   //     'Sign Up using Facebook',
  //   //   ]),
  //   // ]),
  //   Col({type: 'xs-12'}, [
  //     buttons,
  //     // Button({onClick, primary: true, className: 'google'}, [
  //     //   'Sign Up using Google',
  //     // ]),
  //   ]),
  // ])

const footer =
  div('#footer', {static: true}, [
    div('.links.container', {style: {textAlign: 'center'}}, [
      Row({style: {width: '100%'}},[
        Col({type: 'xs-4'},[
          h5({}, 'Contact'),
          ul({}, [
            li({}, [basicLink('Help', 'mailto:help@sparks.network')]),
            li({}, [basicLink('Other', 'mailto:sdebaun@sparks.network')]),
          ]),
        ]),
        Col({type: 'xs-4'},[
          h5({}, 'About'),
          ul({}, [
            li({}, [basicLink(
              'Pricing',
              'http://blog.sparks.network/p/pricing.html'
            )]),
            li({}, [basicLink(
              'Terms of Service',
              'http://blog.sparks.network/p/terms-of-service.html'
            )]),
            li({}, [basicLink(
              'Privacy Policy',
              'http://blog.sparks.network/p/privacy-policy.html'
            )]),
            li({}, [basicLink(
              'Refund Policy',
              'http://blog.sparks.network/p/refunds-and-deposit-returns.html'
            )]),
          ]),
        ]),
        Col({type: 'xs-4'},[
          h5({}, 'News'),
          ul({}, [
            li({}, [basicLink('Blog', 'http://blog.sparks.network')]),
            li({}, [basicLink(
              'Facebook',
              'https://www.facebook.com/sparksvolunteers',
            )]),
          ]),
        ]),
      ]),
    ]),
    Row({}, [
      div('.container', {props: {innerHTML: '&copy; 2016 Sparks.Network'}}),
    ]),
  ])

const landing = (appMenu, buttons) =>
  div('#landing', {}, [
    div('#hook', {
      style: {backgroundImage: 'url("' + headerSrc + '")'},
    }, [
      div({style: {spaceBetween: 'flex-start'}}, [
        headerLogo,
        div({style: {float: 'right'}}, [appMenu]),
      ]),
      h1('.container', {}, 'Doing is living.'),
    ]),
    div('#promise', {static: true}, [
      h2('.container', {}, 'Get Involved Now!'),
    ]),
    div('#more-heart', {
      static: true,
      style: {backgroundImage: 'url("' + iconSrcs.heart + '")'},
    }),
    benefits,
    div('#cta', {static: true}, [
      div('.container', {}, [
        h4({}, ['Sign Up For', br({}), 'The Sparks Network!']),
        div({style: {textAlign: 'center'}}, [buttons]),
        // signUp(buttons),
      ]),
    ]),
    footer,
  ])

export {landing}
