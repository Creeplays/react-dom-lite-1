// @flow

import css from 'dom-helpers/style';
import invariant from 'invariant';
import { setValueOnElement, isEventRegex } from './DOMProperties';
import * as Events from './events';

const isRenderableChild = child =>
  typeof child === 'string' || typeof child === 'number';

export function setInitialProps(domElement: Element, nextProps: Props) {
  Object.entries(nextProps).forEach(([propKey, propValue]) => {
    let match;

    // inline styles!
    if (propKey === 'style') {
      css(domElement, propValue);

      // Quick support for dangerousSetInnerHTML={{__html}}
    } else if (
      propKey === 'dangerouslySetInnerHTML' &&
      propValue &&
      propValue.__html != null
    ) {
      invariant(
        typeof propValue === 'object' && typeof propValue.__html === 'string',
        'The dangerouslySetInnerHTML prop value must be an object with an single __html field'
      );
      domElement.innerHTML = propValue.__html;
      // Handle when `children` is a renderable (text, number, etc)
    } else if (propKey === 'children') {
      // doesn't cover an IE8 issue with textareas
      if (typeof propValue === 'number') propValue = `${propValue}`;
      if (typeof propValue === 'string') domElement.textContent = propValue;

      // Add DOM event listeners
    } else if ((match = propKey.match(isEventRegex))) {
      let [, eventName] = match;
      Events.listenTo(domElement, eventName, (propValue: any), null);
    } else if (propValue != null) {
      setValueOnElement(domElement, propKey, propValue);
    }
  });
}

function diffStyle(lastStyle: any, nextStyle: any) {
  let updates = null;
  if (lastStyle) {
    for (const lastKey in lastStyle) {
      if (!updates) updates = {};
      updates[lastKey] = '';
    }
  }

  if (!updates || !nextStyle) return nextStyle;

  return Object.assign(updates, nextStyle);
}

export function diffProps(
  domElement: Element,
  lastProps: Object,
  nextProps: Object
): ?Array<[string, any]> {
  let updatePayload: ?Array<[string, any]> = null;

  let add = (k, v) => {
    if (!updatePayload) updatePayload = [];
    updatePayload.push([k, v]);
  };

  for (let propKey of Object.keys(lastProps)) {
    if (lastProps[propKey] == null || nextProps.hasOwnProperty(propKey)) {
      continue;
    } else if (propKey.match(isEventRegex)) {
      updatePayload = updatePayload || [];
    }
  }

  for (let entry of Object.entries(nextProps)) {
    const [propKey: string, nextProp: any] = entry;
    const lastProp = lastProps[propKey];

    if (
      nextProp === lastProp ||
      propKey === 'style' ||
      (nextProp == null && lastProp == null)
    ) {
      continue;
    } else if (propKey === 'dangerouslySetInnerHTML') {
      invariant(
        typeof nextProp === 'object',
        'The dangerouslySetInnerHTML prop value must be an object with an single __html field'
      );
      const nextHtml = nextProp ? nextProp.__html : undefined;
      const lastHtml = lastProp ? lastProp.__html : undefined;
      if (nextHtml != null && lastHtml !== nextHtml) {
        add(propKey, nextHtml);
      }
    } else if (
      propKey === 'children' &&
      lastProp !== nextProp &&
      isRenderableChild(nextProp)
    ) {
      add(propKey, nextProp);
    } else if (propKey.match(isEventRegex) && lastProp !== nextProp) {
      // we need the last event handler so we can remove it in the commit phase
      add(propKey, [lastProp, nextProp]);
    } else {
      // For any other property we always add it to the queue and then we
      // filter it out using the whitelist during the commit.
      add(propKey, nextProp);
    }
  }

  let styleUpdates = diffStyle(lastProps.style, nextProps.style);
  if (styleUpdates) {
    add('style', styleUpdates);
  }

  return updatePayload;
}

export function updateProps(
  domElement: Element,
  updateQueue: Array<[string, any]>
) {
  let match;

  for (let [propKey, propValue] of updateQueue) {
    // inline styles!
    if (propKey === 'style') {
      css(domElement, propValue);
    } else if (propKey === 'dangerouslySetInnerHTML') {
      domElement.innerHTML = propValue.__html;

      // Handle when `children` is a renderable (text, number, etc)
    } else if (propKey === 'children') {
      // doesn't cover an IE8 issue with textareas
      if (typeof propValue === 'number') propValue = `${propValue}`;
      if (typeof propValue === 'string') domElement.textContent = propValue;

      // Add DOM event listeners
    } else if ((match = propKey.match(isEventRegex))) {
      let [lastHandler, nextHandler] = propValue;

      Events.listenTo(domElement, match[1], nextHandler, lastHandler);
    } else if (propValue != null) {
      setValueOnElement(domElement, propKey, propValue);
    }
  }
}
