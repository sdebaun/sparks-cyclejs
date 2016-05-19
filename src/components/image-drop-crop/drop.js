import {Observable as $} from 'rx'
import {div, span, input, img} from 'cycle-snabbdom'
import {assoc, prop, propEq, all, merge} from 'ramda'
import accepts from 'attr-accept'
require('./styles.scss')

const typeEq = action => propEq('type', action)

const Component = ({DOM, props$}) => {
  const preventDefault = evt => evt.preventDefault()
  const stopPropagation = evt => evt.stopPropagation()

  const intent$ = $.merge(
    DOM.select('.drop-zone').events('click'),
    DOM.select('.drop-zone').events('dragenter')
      .do(preventDefault),
    DOM.select('.drop-zone').events('dragover')
      .do(preventDefault)
      .do(stopPropagation),
    DOM.select('.drop-zone').events('dragleave')
      .do(preventDefault),
  ).shareReplay(1)

  const dropIntent$ = $.merge(
    DOM.select('.drop-zone').events('drop'),
    DOM.select('.drop-zone input').events('change'),
  )
  .do(preventDefault)
  .shareReplay(1)

  const allAccepted = accept => all(file => accepts(file, accept))
  const noFiles = {active: false, accepted: true, dropped: false, files: []}

  const enteredFiles$ = intent$
    .filter(typeEq('dragenter'))
    .map(evt =>
      evt.dataTransfer && evt.dataTransfer.items || [])
    .map(items =>
      Array.prototype.slice.call(items))
    .combineLatest(props$, (files, {accept}) =>
      ({active: true, accepted: allAccepted(accept)(files), files}))

  const leftFiles$ = intent$
    .filter(typeEq('dragleave'))
    .map(noFiles)

  const droppedFiles$ = dropIntent$
    .map(evt => evt.dataTransfer ? evt.dataTransfer.files : evt.target.files)
    .map(files => Array.prototype.slice.call(files))
    .map(files => ({active: false, dropped: true, files}))
    .shareReplay(1)

  const filesModel$ = $.merge(
    enteredFiles$,
    leftFiles$,
    droppedFiles$
  )
  .startWith(noFiles)
  .scan(merge)

  const inputAttrs = {
    type: 'file',
  }

  const file$ = filesModel$
    .filter(prop('dropped'))
    .map(({files}) => files[0])
    .map(file => assoc('url', window.URL.createObjectURL(file))(file))

  const image$ = file$
    .map(file => img({
      attrs: {src: file.url},
    }))
    .startWith(null)

  const label$ = props$.map(({title}) =>
    span(title || 'Drop image'))

  const vtree$ = $.combineLatest(filesModel$, label$, image$,
    ({active, accepted, dropped, files}, label, image) =>
      div('.drop-zone', {
        class: {
          active: active,
          dropped: dropped,
          accepted: files.length > 0 && accepted,
          rejected: files.length > 0 && !accepted,
        },
      }, [
        input({
          attrs: inputAttrs,
        }),
        image || label,
      ]))

  return {
    DOM: vtree$,
    file$,
  }
}

export default Component
