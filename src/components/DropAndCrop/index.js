import Dropper from './Dropper'
import Cropper from './Cropper'
// import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import {col} from 'helpers'
import {img, h5} from 'cycle-snabbdom'
import {Row, Button} from 'snabbdom-material'

const imageStyle = {
  border: 'solid 2px black',
  height: '128px',
  width: '128px',
}

const _render = ({dropper, dropped, cropper, cropped}) =>
  col(
    dropped ? cropper : dropper,
    Row({style: {textAlign: 'center'}}, [
      col(
        h5({style: {marginTop: '0.5em', textAlign: 'center'}}, [
          cropped ? 'Image Preview' : null,
        ]),
        cropped && img({attrs: {src: cropped}, style: imageStyle}),
      ),
      cropped && Button({className: 'submit', onClick: true}, [
        'Click me when finished!',
      ]),
    ])
  )

export default (sources) => {
  const click$ = sources.DOM.select('.submit').events('click')
  const {DOM: dropper, dropped$} = Dropper()
  const {DOM: cropper, cropped$} = Cropper({image$: dropped$})

  const dataUrl$ = cropped$.sample(click$)

  const viewState = {
    dropper, dropped$,
    cropper, cropped$,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, dataUrl$, cropped$}
}
