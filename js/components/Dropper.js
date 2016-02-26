import React from 'react'
import ReactDOM from 'react-dom'
import Dropzone from 'react-dropzone'
import {BehaviorSubject} from 'rx'
import {reactComponent} from 'helpers'

const ReactDropper = ({dropped$}) =>
  <Dropzone multiple={false} disableClick={true} onDrop={e=>dropped$.onNext(e[0].preview)} style={{}}>
    <div style={{padding:'1em',display:'flex',justifyContent:'center', alignItems:'center',border: '3px dashed #666',borderRadius:'1em'}}>
      <span>Drop an Image</span>
    </div>
  </Dropzone>

export default sources =>{
  const dropped$ = new BehaviorSubject(null)

  return {
    dropped$, // has to be attached on 'insert', breaks if changed to 'update'
    DOM: dropped$.map( droppedImage=> reactComponent(ReactDropper,{dropped$},'insert') )
  }
}
