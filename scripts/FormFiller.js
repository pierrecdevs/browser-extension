/*
 * Copyright (c) 2023 - 2024. Pierre C
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

function FormFiller() {
  const pendingEvents = new Set();

  const triggerCustomEvent = (fieldElement, eventAction, args) => {
    fieldElement = getElement(fieldElement);

    if (fieldElement) {
      const eventId = `${eventAction}-${Date.now()}-${Math.random()}`;
      const startEvent = new CustomEvent(`${eventAction}Start`, args);
      fieldElement.dispatchEvent(startEvent);

      pendingEvents.add(eventId);

      const res = fieldElement.dispatchEvent(
          new CustomEvent(eventAction, args));

      pendingEvents.delete(eventId);

      const endEvent = new CustomEvent(`${eventAction}End`,
          {detail: {result: res}});
      fieldElement.dispatchEvent(endEvent);

      return Promise.resolve(res);
    }

    return Promise.reject({'ELEMENT_NOT_FOUND': fieldElement});
  };

  const triggerEvent = (fieldElement, eventAction) => {
    fieldElement = getElement(fieldElement);

    if (fieldElement) {
      const eventId = `${eventAction}-${Date.now()}-${Math.random()}`;
      const startEvent = new CustomEvent(`${eventAction}Start`, {});
      fieldElement.dispatchEvent(startEvent);

      pendingEvents.add(eventId);

      const res = fieldElement.dispatchEvent(
          new Event(eventAction, {bubbles: true, cancelable: true}));

      pendingEvents.delete(eventId);

      const endEvent = new CustomEvent(`${eventAction}End`,
          {detail: {result: res}});
      fieldElement.dispatchEvent(endEvent);

      return Promise.resolve(res);
    }

    return Promise.reject({'ELEMENT_NOT_FOUND': fieldElement});
  };

  const triggerMouseEvent = (fieldElement, eventAction) => {
    fieldElement = getElement(fieldElement);

    if (fieldElement) {
      const eventId = `${eventAction}-${Date.now()}-${Math.random()}`;
      const startEvent = new CustomEvent(`${eventAction}Start`, {});
      fieldElement.dispatchEvent(startEvent);

      pendingEvents.add(eventId);

      const res = fieldElement.dispatchEvent(new MouseEvent(eventAction,
          {bubbles: true, cancelable: true, clientX: 0, clientY: 0}));

      pendingEvents.delete(eventId);

      const endEvent = new CustomEvent(`${eventAction}End`,
          {detail: {result: res}});
      fieldElement.dispatchEvent(endEvent);

      return Promise.resolve(res);
    }

    return Promise.reject({'ELEMENT_NOT_FOUND': fieldElement});
  };

  const typeField = async (fieldElement, words) => {
    let textField = fieldElement;

    if ('string' === typeof textField) {
      textField = document.querySelector(
          `input[name="${fieldElement}"]`,
      );
    }

    if (textField) {
      textField.value = words;
      const events = ['keydown', 'keyup', 'change'];
      return Promise.all(events.map(event => triggerEvent(textField, event)));
    }
  };

  const selectRadioByValue = async (fieldElement, value) => {
    let radioField = fieldElement;

    if ('string' === typeof radioField) {
      radioField = document.querySelector(
          `input[type="radio"][name="${fieldElement}"][value="${value}"]`,
      );
    }

    if (radioField) {
      radioField.checked = true;
      radioField.value = value;
      return await triggerEvent(radioField, 'change');
    }
  };

  const selectRadioByLabel = async (fieldElement, value) => {
    let radioFields = fieldElement;

    if ('string' === typeof radioFields) {
      radioFields = Array.from(
          document.querySelectorAll(
              `input[type="radio"][name="${fieldElement}"]`),
      );
    }

    if (!radioFields) return;

    radioFields.forEach(async (radioField) => {
      const label = radioField.closest('label');

      if (!label && !radioField) {
        return;
      }

      const text = label.querySelector('.label-option');

      if (text && text.textContent.trim().toLowerCase() === value.toLowerCase()) {
        radioField.checked = true;
        return await triggerEvent(radioField, 'change');
      }
    });

  };

  const selectDropdownByValue = async (fieldElement, value) => {
    return await selectDropdownByAttribute(fieldElement, 'value', value);
  };

  const selectDropdownByLabel = async (fieldElement, value) => {
    return await selectDropdownByAttribute(fieldElement, 'label', value);
  };

  const selectDropdownByAttribute = async (fieldElement, attribute, value) => {
    let selectField = fieldElement;

    if ('string' === typeof selectField) {
      selectField = document.querySelector(`select[name="${fieldElement}"]`);
    }

    if (selectField) {
      const index = Array.from(selectField.options).findIndex(
          (option) => value === option[attribute],
      );

      if (index !== -1) {
        selectField.selectedIndex = index;
        await triggerEvent(selectField, 'change');
      }
    }
  };

  const clickElement = async (fieldElement) => {

    if ('string' === typeof fieldElement) {
      fieldElement = document.querySelector(fieldElement);
    }

    if (fieldElement) {
      return await triggerMouseEvent(fieldElement, 'click');
    }
  };

  const getElement = (fieldElement) => {
    if ('string' === typeof fieldElement) {
      return document.querySelector(fieldElement);
    }

    return fieldElement;
  };

  return {
    triggerCustomEvent,
    triggerEvent,
    triggerMouseEvent,
    typeField,
    selectDropdownByAttribute,
    selectDropdownByLabel,
    selectDropdownByValue,
    selectRadioByValue,
    selectRadioByLabel,
    clickElement,
    getElement,
    getPendingEvents: () => Array.from(pendingEvents),
  };
}

window.FormFiller = new FormFiller;
console.log('Formfiller Injected.');