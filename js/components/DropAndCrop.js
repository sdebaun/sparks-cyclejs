import Dropper from 'components/Dropper'
import Cropper from 'components/Cropper'
import {Observable} from 'rx';
import {div, img} from 'cycle-snabbdom';

export default (sources) =>{
  const dropper = Dropper()
  const cropper = Cropper({image$:dropper.dropped$})

  return {
    DOM: Observable.combineLatest(dropper.DOM,dropper.dropped$,cropper.DOM,cropper.cropped$)
      .map( ([dropper,dropped,cropper,cropped])=>
        div([
          (dropped ? cropper : dropper),
          (cropped && img({attrs:{src:cropped}}))
          ])
         )
  }
}
