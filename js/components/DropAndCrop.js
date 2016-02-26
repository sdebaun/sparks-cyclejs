import Dropper from 'components/Dropper'
import Cropper from 'components/Cropper'
import {Observable, BehaviorSubject} from 'rx';
import {div, img} from 'cycle-snabbdom';

export default (sources) =>{
  const dropper = Dropper()
  const cropper = Cropper({image$:dropper.dropped$})

  // dropper.dropped$.subscribe( e=>console.log('dropped',e))
  cropper.cropped$.tap( x=>console.log('cropped',x))

  return {
    // DOM: dropper.DOM
    DOM: Observable.combineLatest(dropper.DOM,dropper.dropped$,cropper.DOM,cropper.cropped$)
      .map( ([dropper,dropped,cropper,cropped])=>
        div([
          (dropped ? cropper : dropper),
          (cropped && img({attrs:{src:cropped}}) || div('no crop'))
          ])
         )
  }
}

            // <Cropper {...{style,aspectRatio,src:image,crop:onCrop,autoCrop:true}}/>
