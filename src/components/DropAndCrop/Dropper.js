import React from 'react'
import ReactDOM from 'react-dom'
import ReactDropzone from 'react-dropzone'
import {BehaviorSubject} from 'rx'
import {reactComponent} from 'helpers'

const divStyle = {
  padding: '1em',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  border: '3px dashed #666',
  borderRadius: '1em',
}

const Dropper = ({dropped$}) =>
  <ReactDropzone multiple={false} disableClick={false}
    onDrop={e => dropped$.onNext(e[0].preview)} style={{}}>
      <div style={divStyle}>
        <span>Drop an Image or click to upload</span>
      </div>
  </ReactDropzone>

export default () => {
  const dropped$ = new BehaviorSubject(null)

  return {
    dropped$, // has to be attached on 'insert', breaks if changed to 'update'
    DOM: dropped$.map(
      () => reactComponent(Dropper, {dropped$}, 'insert')
    ),
  }
}
