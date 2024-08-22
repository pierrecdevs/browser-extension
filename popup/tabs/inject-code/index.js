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

const outputElm = document.getElementById('output');
const codeElm = document.getElementById('code');
const submitElm = document.getElementById('inject-code-snippet');
const resetElm = document.getElementById('reset');

const port = chrome.runtime.connect({name: 'devhelper-tde'});

const renderHtml = (html) => {
  if (outputElm) {
    outputElm.innerHTML = html;
  }
};

if (port) {
  port.onMessage.addListener((data) => {
    console.log('[popup.js] Message', data);
    // TODO: need to make a helper library to update display.

    const {from, message, action} = data;

    renderHtml(message);
  });
}

if (submitElm) {
  submitElm.addEventListener('click', async () => {
    event.preventDefault();
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const response = await port.postMessage(
        {from: 'popup-inject-code', message: codeElm.value, tab});
    console.log('[popup.js] Response', response);
  });
}
