import Dropper from './Dropper'
import Cropper from './Cropper'
import {Observable} from 'rx'
import {div, img} from 'cycle-snabbdom'

export default (sources) => {
  const dropper = Dropper()
  const cropper = Cropper({image$: dropper.dropped$})

  return {
    DOM: Observable.combineLatest(
      dropper.DOM, dropper.dropped$, cropper.DOM, cropper.cropped$
    ).map(([dropperDOM, dropped, cropperDOM, cropped]) =>
      div([
        dropped ? cropper : dropper,
        cropped && img({attrs: {src: cropped}}),
      ])
    ),
  }
}
