import React from 'react'
import ReactDOM from 'react-dom'
import Dropzone from 'react-dropzone'
import {Observable, BehaviorSubject} from 'rx';
import {div,img} from 'cycle-snabbdom';

export default sources =>{
  const dropped$ = new BehaviorSubject(null)

  return {
    dropped$,
    DOM: dropped$.map( droppedImage=>
      droppedImage &&
      div('the image') ||
      div({
        hook: {
          insert: ({elm})=> ReactDOM.render(
            <Dropzone multiple={false} disableClick={true} onDrop={e=>dropped$.onNext(e[0].preview)} style={{}}>
              <div style={{padding:'1em',display:'flex',justifyContent:'center', alignItems:'center',border: '3px dashed #666',borderRadius:'1em'}}>
                <span>Drop an Image or</span>
              </div>
            </Dropzone>
          ,elm)
        }
      })
    )
  }
}
