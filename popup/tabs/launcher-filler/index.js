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

const port = chrome.runtime.connect({name: 'devhelper-tde'});
const renderHtml = (html) => {
  if (outputElm) {
    outputElm.innerHTML = html;
  }
};

if (port) {

  const vehicleFormBtn = document.getElementById('form-filler-fill-vehicle');
  const driverFormBtn = document.getElementById('form-filler-fill-driver');
  const submitAutoForm = document.getElementById(
      'form-filler-fill-submit-auto');
  const submitHomeForm = document.getElementById(
      'form-filler-fill-submit-home');

  port.onMessage.addListener(async (data) => {
    let response = '';

    const {from, message, action} = data;
    // renderHtml(message);

    console.log('[popup.js] Message', data);
    console.log('[popup.js] Response', response);
  });

  const fillForm = async (formName, submit) => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    return await port.postMessage({
      from: 'popup-fill-form', message: {
        form: formName,
        submit,
      },
      tab,
    });
  };

  vehicleFormBtn.addEventListener('click', async () => {
    console.log('Filling vehicle page...');
    await fillForm('surex.fill.vehicle-page', submitAutoForm.checked);
  });

  driverFormBtn.addEventListener('click', async () => {
    console.log('Filling driver page...');
    await fillForm('surex.fill.driver-page', submitAutoForm.checked);
  });
}
