// TODO: PRIORITY
require('./styles.scss')

import {Observable} from 'rx'
const {just, combineLatest} = Observable

import combineLatestObj from 'rx-combine-latest-obj'
import {div} from 'cycle-snabbdom'

import {Appbar} from 'snabbdom-material'
import {icon} from 'helpers'

const bgStyle = url => ({
  backgroundImage: url &&
    'linear-gradient(rgba(0,0,0,0.60),rgba(0,0,0,0.90)), url(' + url + ')' ||
    'linear-gradient(rgba(0,0,0,0.80),rgba(0,0,0,0.80))',
})

const TitleContent = sources => ({
  DOM: combineLatest(
    sources.topDOM$ || just(null),
    sources.leftDOM$ || just(null),
    sources.titleDOM$ || just('no titleDOM$'),
    sources.subtitleDOM$ || just(null),
    sources.rightDOM$ || just(null),
    (top,left,title,subtitle,right) =>
      div('.content', [
        top,
        div('.bottom', [
          left && div('.left', [left]),
          div('.main', [
            div('.title',title),
            subtitle && div('.subtitle',subtitle),
          ]),
          right && div('.right', [right]),
        ]),
      ])
  ),
})

const ResponsiveTitle = sources => {
  const content = TitleContent(sources)
  const url$ = sources.backgroundUrl$ || just(null)
  const classes$ = sources.classes$ || just([])

  return {
    DOM: combineLatest(
      sources.isMobile$, url$, classes$,
      (m, url, classes) =>
        div('.title-block.' + classes.join('.'), {style: bgStyle(url)},
          m ? [content.DOM, sources.tabsDOM$] : [content.DOM]
        )
    ),
  }
}

export {ResponsiveTitle}

const style = (bgUrl) => ({
  backgroundImage: bgUrl &&
    'linear-gradient(rgba(0,0,0,0.60),rgba(0,0,0,0.90)), url(' + bgUrl + ')' ||
    'linear-gradient(rgba(0,0,0,0.80),rgba(0,0,0,0.80))',
  zIndex: 0,
  color: 'white',
  minHeight: '120px',
  backgroundSize: 'cover',
})

const _DOM = ({
  isMobile,
  backgroundUrl,
  labelText = 'No Label',
  subLabelText = '',
  quickNavDOM,
  tabsDOM,
}) =>
  div({style: style(backgroundUrl), class: {title: true}},[
    quickNavDOM,
    div({style: {padding: '0.5em', lineHeight: '48px'}},[
      isMobile && Appbar.Button({className: 'nav-button'}, [icon('menu')]),
      div({style: {lineHeight: '24px'}},[
        div({style: {fontSize: '18px', fontWeight: 'bold'}},[labelText]),
        div({style: {fontSize: '14px'}},[subLabelText]),
      ]),
    ]),
    isMobile ? tabsDOM : null,
  ])

export default ({
  isMobile$, labelText$, subLabelText$, tabsDOM$, quickNavDOM$, backgroundUrl$,
}) => {
  const DOM = combineLatestObj({
    isMobile$,
    labelText$,
    backgroundUrl$: backgroundUrl$ || Observable.just(null),
    subLabelText$: subLabelText$ || Observable.just(null),
    tabsDOM$: tabsDOM$ || Observable.just(null),
    quickNavDOM$: quickNavDOM$ || Observable.just(null),
  }).map(_DOM)

  return {DOM}
}

