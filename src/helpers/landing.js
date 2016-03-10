import {div, h1, h2, h3, h4, h5, ul, li, a, b, br} from 'cycle-snabbdom'
import {Col, Row, Button} from 'snabbdom-material'

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
          ' for the help that you give with perks and access to new opportunities.',
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

const onClick = () => {}

const signUp =
  Row({style: {width: '100%', textAlign: 'center'}, className: 'signup'}, [
    Col({type: 'xs-6'}, [
      Button({onClick, primary: true, className: 'facebook'}, [
        'Sign Up using Facebook',
      ]),
    ]),
    Col({type: 'xs-6'}, [
      Button({onClick, primary: true, className: 'google'}, [
        'Sign Up using Google',
      ]),
    ]),
  ])

const footer =
  div('#footer', {static: true}, [
    div('.links.container', {style: {textAlign: 'center'}}, [
      Row({style: {width: '100%'}},[
        Col({type: 'xs-4'},[
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
        Col({type: 'xs-4'},[
          h5({}, 'About'),
          ul({}, [
            li({}, [basicLink('Mission')]),
            li({}, [basicLink('Now Hiring')]),
            li({}, [basicLink('Our Team')]),
          ]),
        ]),
        Col({type: 'xs-4'},[
          h5({}, 'News'),
          ul({}, [
            li({}, [basicLink('Blog')]),
            li({}, [basicLink('Facebook')]),
            li({}, [basicLink('Twitter')]),
          ]),
        ]),
      ]),
    ]),
    Row({}, [
      div('.container', {props: {innerHTML: '&copy; 2016 Sparks.Network'}}),
    ]),
  ])

const landing = (appMenu) =>
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
        signUp,
      ]),
    ]),
    footer,
  ])

export {landing}
