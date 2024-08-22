/*
 * Copyright (c) 20023 - 2024. Pierre C
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

const snippets = [
  'getAllFormNames',
  'getAllFormElements',
  'getAllFormElementsWithoutName'];
const outputElm = document.getElementById('output');

const port = chrome.runtime.connect({name: 'devhelper-tde'});

const renderHtml = (html) => {
  if (outputElm) {
    outputElm.innerHTML = html;
  }
};

const addSnippet = (name) => {
  const snippetsElm = document.getElementById('snippets');
  if (!snippetsElm) {
    return;
  }

  const anchorButton = document.createElement('button');

  anchorButton.textContent = name;
  anchorButton.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const response = await port.postMessage(
        {from: 'popup-form-utilities', message: `${name}-click`, tab});
    console.log('[popup.js] Response', response);
  });

  snippetsElm.appendChild(anchorButton);
};

const renderSnippets = () => {
  snippets.forEach((s) => addSnippet(s));
};

const displayResults = (results) => {

  outputElm.innerHTML = '';

  [...results].forEach((result) => {

    const div = document.createElement('div');
    const h4 = document.createElement('h4');

    h4.textContent = result.form;
    div.appendChild(h4);

    const table = document.createElement('table');
    table.setAttribute('role', 'grid');

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const headers = [
      'ID',
      'Element',
      'Type',
      'Name',
      'Text',
      'HTML',
      'Classlist'];
    const tr = document.createElement('tr');

    headers.forEach((header) => {
      const th = document.createElement('th');
      th.textContent = header;
      tr.appendChild(th);
    });

    thead.appendChild(tr);
    table.appendChild(thead);

    result.elements.forEach((element) => {
      // tag: el.tagName.trim(),
      // text: el.textContent.trim(),
      // html: el.innerHTML.toString().trim(),
      // id: el.id,
      // type: el.type,
      // classes: el.classList.toString().trim(),
      const {id, tag, type, name, text, html, classList} = element;
      const tr = document.createElement('tr');

      const idTd = document.createElement('td');
      idTd.textContent = id;
      tr.appendChild(idTd);

      const tagTd = document.createElement('td');
      tagTd.textContent = tag;
      tr.appendChild(tagTd);

      const typeTd = document.createElement('td');
      typeTd.textContent = type;
      tr.appendChild(typeTd);

      const nameTd = document.createElement('td');
      nameTd.textContent = name;
      tr.appendChild(nameTd);

      const textTd = document.createElement('td');
      textTd.textContent = text;
      tr.appendChild(textTd);

      const htmlTd = document.createElement('td');
      htmlTd.textContent = html;
      tr.appendChild(htmlTd);

      const classesTd = document.createElement('td');
      classesTd.textContent = classList.toString();
      console.log('[popup.js] Classes', classList);
      tr.appendChild(classesTd);

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    console.log('[popup.js] Make Table', results);
    div.appendChild(table);
    outputElm.appendChild(div);
  });
};

if (port) {
  port.onMessage.addListener((data) => {
    console.log('[popup.js] Message', data);
    // TODO: need to make a helper library to update display.

    const {from, message, action} = data;
    console.log('[popup.js] message', message);
    const {forms} = message;
    if (!forms) {
      return;
    }

    if (0 === forms.length) {
      renderHtml('<h2>There are no forms on this page.</h2>');
    } else if (forms.length === 1) {
      if ('getAllFormElementsWithoutName' === action || 'getAllFormElements' ===
          action) {
        displayResults(forms);
        return;
      }
      renderHtml(`
        <hgroup>
          <h2>There is <b>1</b> form on this page.</h2>
          <h3>Form name: ${forms[0]}</h3>
        </hgroup>
      `);
    } else {
      renderHtml(`
        <hgroup>
          <h2>There are <b>${forms.length}</b> forms on this page.</h2>
          <h3>Primary form named: ${forms[0]}</h3>
        </hgroup>
      `);
    }
  });

  port.onDisconnect.addListener(async () => {
    console.warn('[popup.js] Failed to Connect using content.js');

    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const response = await chrome.tabs.sendMessage(tab.id,
        {from: 'devhelper-tde', message: 'legacy'});
  });
}

renderSnippets();

