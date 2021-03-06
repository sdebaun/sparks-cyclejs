import {div, h} from 'cycle-snabbdom'

export const row = (style, ...els) =>
  div({style: {display: 'flex', ...style}}, els)

export const cell = (style, ...els) =>
  div({style: {flex: '1', ...style}}, els)

export const cellC = (_class, ...els) =>
  div({style: {flex: '1'}, class: _class}, els)

export const icon = (name, className) =>
  h(`i.icon-${name}.${className}`,[])
