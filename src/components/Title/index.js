// TODO: PRIORITY
require('./styles.scss')

import {Observable} from 'rx'
const {just, combineLatest} = Observable

import combineLatestObj from 'rx-combine-latest-obj'
import {div} from 'cycle-snabbdom'

import {Appbar} from 'snabbdom-material'
import {icon} from 'helpers'

const sparkly = '/' + require('images/pitch/sparklerHeader-2048.jpg')

const bgStyle = url => ({
  backgroundImage: url &&
    'linear-gradient(rgba(0,0,0,0.40),rgba(0,0,0,0.60)), url(' + url + ')' ||
    'linear-gradient(rgba(0,0,0,0.40),rgba(0,0,0,0.60))',
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

export const sidenavButton =
  Appbar.Button({className: 'nav-button'}, [icon('menu')])

export const SidedrawerTitle = sources => {
  const content = TitleContent(sources)
  const url$ = sources.backgroundUrl$ || just(null)
  const classes$ = sources.classes$ || just([])

  const route$ = sources.DOM.select('.title-block.sidedrawer').events('click')
    .map('/dash')

  return {
    DOM: combineLatest(
      sources.isMobile$, url$, classes$,
      (m, url, classes) =>
        div('.title-block.sidedrawer.' + classes.join('.'),
          {style: bgStyle(url || sparkly)},
          [content.DOM]
        )
    ),
    route$,
  }
}

export const TabbedTitle = sources => {
  // const rightDOM$ = just(sidenavButton)

  const content = TitleContent({...sources,
    // rightDOM$: sources.isMobile$
      // .flatMapLatest(m => m && rightDOM$ || just(null)),
    // subtitleDOM$: sources.isMobile$
    //   .flatMapLatest(m => m && sources.subtitleDOM$ || just(null)),
  })
  const url$ = sources.backgroundUrl$ || just(null)
  const classes$ = sources.classes$ || just([])

  return {
    DOM: combineLatest(
      sources.isMobile$, url$, classes$,
      (m, url, classes) =>
        div('.title-block.' + classes.join('.'),
          {style: bgStyle(url || sparkly)},
          [content.DOM, sources.tabsDOM$]
        )
    ),
  }
}

const ResponsiveTitle = sources => {
  // const rightDOM$ = just(sidenavButton)

  const content = TitleContent({...sources,
    // rightDOM$: sources.isMobile$
      // .flatMapLatest(m => m && rightDOM$ || just(null)),
    // subtitleDOM$: sources.isMobile$
    //   .flatMapLatest(m => m && sources.subtitleDOM$ || just(null)),
  })
  const url$ = sources.backgroundUrl$ || just(null)
  const classes$ = sources.classes$ || just([])

  return {
    DOM: combineLatest(
      sources.isMobile$, url$, classes$,
      (m, url, classes) =>
        div('.title-block.' + classes.join('.'),
          {style: bgStyle(url || sparkly)},
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

