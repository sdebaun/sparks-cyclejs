require('./styles.scss')

import {Observable as $} from 'rx'
import {div} from 'cycle-snabbdom'

export const Grid = sources => ({
  DOM: sources.content$.map(content => div('.grid',content)),
})

export const LargeCard = sources => {
  const elevation$ = sources.elevation$ || $.just(1)
  const content$ = sources.content$ || $.just('need content$')
    .map((...c) => c)

  const DOM = $.combineLatest(
    elevation$, content$,
    (elevation, content) =>
      div('.col-xs-12',[
        div(`.card.paper${elevation}`, content),
      ])
  )

  return {DOM}
}

export const Card = sources => {
  const elevation$ = sources.elevation$ || $.just(1)
  const content$ = sources.content$ || $.just('need content$')
    .map((...c) => c)
  const classes = sources.classes || '.col-md-6.col-xs-12'

  const DOM = $.combineLatest(
    elevation$, content$,
    (elevation, content) =>
      div(classes, [
        div(`.card.paper${elevation}`, content),
      ])
  )

  return {DOM}
}

export const TitledCard = sources => {
  const title$ = sources.title$ || $.just('no $title')
  const bodyContent$ = sources.content$ || $.just(['no $content'])
  const cardComponent = sources.cardComponent || Card

  const content$ = $.combineLatest(
    title$, bodyContent$,
    (title, content) => [
      div('.cardtitle',[title]),
      div('.cardcontent',content),
    ]
  )

  return cardComponent({...sources, content$})
}

const sparkly = require('images/pitch/sparklerHeader-2048.jpg')

const GRADIENT = 'linear-gradient(rgba(0,0,0,0.50),rgba(0,0,0,0.65),rgba(0,0,0,0.80),rgba(0,0,0,0.80))' //eslint-disable-line max-len

const bgStyle = src => ({
  class: {cardmedia: true},
  style: {
    backgroundImage: `${GRADIENT}, url(${src || '/' + sparkly})`,
  },
})

import {ListItemCollapsible} from 'components/sdm'

export const ComplexCard = sources => {
  const src$ = sources.src$ || $.just(null)
  const title$ = sources.title$ || $.just('no $title')
  const subtitle$ = sources.subtitle$ || $.just(null)
  // const toolbarContent$ = sources.toolbarContent$ || $.just(null)
  // const bodyContent$ = sources.content$ || $.just(['no $content'])

  const click$ = sources.DOM.select('.cardmedia').events('click')

  const toolbar = ListItemCollapsible({...sources,
    title$: $.just(null),
    subtitle$: $.just(null),
  })

  const content$ = $.combineLatest(
    src$, title$, subtitle$, toolbar.DOM,
    (src, title, subtitle/*, tb*/) => [
      div(bgStyle(src), [
        div('.title',[title]),
        div('.subtitle',[subtitle]),
      ]),
      // tb,
      // div('.cardcontent',[content]),
    ]
  )

  return {
    ...Card({...sources, content$}),
    click$,
  }
}

export const NavigatingComplexCard = sources => {
  const card = ComplexCard(sources)
  const path$ = sources.path$ || $.just('/')
  const route$ = card.click$
    .withLatestFrom(
      path$,
      (click,path) => path
    )
  return {
    ...card,
    route$,
  }
}
