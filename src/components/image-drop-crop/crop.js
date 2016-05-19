import {Observable as $} from 'rx'
import {div, img} from 'cycle-snabbdom'
import {dissoc} from 'ramda'
import Cropper from 'cropperjs'
require('cropperjs/dist/cropper.css')

const component = ({DOM, props$}) => {
  const evt$ = DOM.select('.crop').events('crop').share()

  const image$ = evt$.flatMap(evt => {
    const canvas = evt.target.cropper.getCroppedCanvas()
    return $.create(obs =>
      canvas.toBlob(blob => obs.onNext({...evt.detail, blob})))
  }).shareReplay(1)

  const vtree$ = props$.map(props =>
    div('.crop', [img({
      cropProps: props,
      hook: {
        insert: vnode => {
          vnode.cropper = new Cropper(vnode.elm, dissoc('image', props))
        },
        update: vnode => {
          vnode.elm.cropper.clear().reset()
          vnode.elm.cropper.replace(props.image)
        },
        destroy: vnode => {
          if (vnode.elm.cropper) {
            vnode.elm.cropper.destroy()
          }
        },
      },
    })]))
    .shareReplay(1)

  return {
    DOM: vtree$,
    image$,
  }
}

export default component
