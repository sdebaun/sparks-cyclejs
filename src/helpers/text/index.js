import {div} from 'cycle-snabbdom'

require('./styles.scss')

export const textTweetSized = text =>
  div({class: {text: true, tweetSized: true}}, [text])
  // div({className: 'tweetSize'}, [text])

export const textQuote = text =>
  div({class: {text: true, quote: true}}, [text])

// export const quoteText = text =>
//   div({class: {text: true, quote: true}}, [text])
