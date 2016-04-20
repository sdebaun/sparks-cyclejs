require('./styles.scss')

import {Observable as $} from 'rx'
import {div} from 'cycle-snabbdom'

export const Grid = sources => ({
  DOM: sources.content$.map(content => div('.grid',content)),
})

export const Card = sources => {
  const elevation$ = sources.elevation$ || $.just(1)
  const content$ = sources.content$ || $.just('need content$')
    .map((...c) => c)

  const DOM = $.combineLatest(
    elevation$, content$,
    (elevation, content) =>
      div('.col-md-6',[
        div(`.card.paper${elevation}`, content),
      ])
  )

  return {DOM}
}

export const TitledCard = sources => {
  const title$ = sources.title$ || $.just('no $title')
  const bodyContent$ = sources.content$ || $.just(['no $content'])

  const content$ = $.combineLatest(
    title$, bodyContent$,
    (title, content) => [
      div('.cardtitle',[title]),
      div('.cardcontent',content),
    ]
  )

  return Card({...sources, content$})
}

const sparkly = require('images/pitch/sparklerHeader-2048.jpg')

const GRADIENT = 'linear-gradient(rgba(0,0,0,0.40),rgba(0,0,0,0.60))'

const bgStyle = src => ({
  class: {cardmedia: true},
  style: {
    backgroundImage: `${GRADIENT}, url(${src || '/' + sparkly})`,
  },
})

export const ComplexCard = sources => {
  const src$ = sources.src$ || $.just(null)
  const title$ = sources.title$ || $.just('no $title')
  const subtitle$ = sources.subtitle$ || $.just(null)
  // const toolbarContent$ = sources.toolbarContent$ || $.just(null)
  // const bodyContent$ = sources.content$ || $.just(['no $content'])

  const click$ = sources.DOM.select('.cardmedia').events('click')

  const content$ = $.combineLatest(
    src$, title$, subtitle$,
    (src, title, subtitle) => [
      div(bgStyle(src), [
        div('.title',[title]),
        div('.subtitle',[subtitle]),
      ]),
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
