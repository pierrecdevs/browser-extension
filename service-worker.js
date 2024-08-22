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

let submitAutoForm = false;
/**
 *
 * @param {Object} target - Object containing the {tabId: tabId} where to inject the code.
 * @param {Function} fn - Function to execute
 * @returns {Promise<Awaited<[{result}]>|*>}
 */
const executeScript = async (target, fn) => {
  try {
    return await chrome.scripting.executeScript({target, func: fn});
  } catch (e) {
    return Promise.resolve([{result: e}]);
  }
};

/**
 *
 * @param {Object} target - Object containing the {tabId: tabId} where to inject the code.
 * @param {Function} fn - Function to execute
 * @returns {Promise<Awaited<[{result}]>|*>}
 */
const executeMainWorldScript = async (target, fn) => {
  try {
    return await chrome.scripting.executeScript({
      target,
      func: (code) => {
        const scriptElm = document.createElement('script');
        scriptElm.textContent = code;
        (document.head || document.documentElement).appendChild(scriptElm);
        scriptElm.remove();
      },
      args: [fn],
      world: 'MAIN',
    });
  } catch (ex) {
    console.error('Could not inject', ex);
    return Promise.resolve([{result: ex}]);
  }
};

/**
 *
 * @param {Object} target - Object containing the {tabId: tabId} where to inject the code.
 * @param {string} path - Path to file to inject.
 * @returns {Promise<Awaited<[{result}]>|*>}
 */
const injectScriptFile = async (target, path) => {
  try {
    await chrome.scripting.executeScript({
      target,
      files: [path],
    });
    return [{result: 'Script injected successfully'}];
  } catch (ex) {
    console.error('Could not inject:', ex);
    return Promise.resolve([{result: ex}]);
  }
};

/**
 *
 * @param {string} input
 * @returns {string}
 */
const hyphenToCamelCase = (input) => {
  return input.split('-').
      map((word, index) => index === 0 ?
          word :
          word.charAt(0).toUpperCase() + word.slice(1)).
      join('');
};

chrome.runtime.onConnect.addListener(async (port) => {

  console.log('[service-worker.js] Connected', port);

  if (port.name !== 'devhelper-tde') {
    console.warn('[service-worker.js] Not the port I\'m looking for', port);
    return;
  }

  port.onMessage.addListener(async (request) => {
    console.log('[service-worker.js] Message', request);
    const {from, message, tab} = request;

    let results;
    let code;

    if ('popup-inject-code' === from) {
      code = message;
      console.log('[service-worker.js] Requesting to run', code, tab.id);
      await executeMainWorldScript({tabId: tab.id}, code);

      return;
    } else if ('popup-fill-form' === from) {
      const {form, submit} = message;

      console.log('Form: %s\nPath: %s', form);
      let results = await injectScriptFile({tabId: tab.id},
          'scripts/FormFiller.js');

      console.log('[service-worker.js] Filling form..', form);
      submitAutoForm = submit;
      // if ('vehicleForm' === form) {
      //   executeScript({tabId: tab.id}, fillVehiclePage);
      // } else if ('driverForm' === form) {
      //   executeScript({tabId: tab.id}, fillDriverPage);
      // }
      const parts = form.split('.');
      const [brand, action, functionName] = parts;
      const actionFileName = `${brand}.${action}.${functionName}.js`;

      try {
        const indexUrl = chrome.runtime.getURL('/actions/index.json');
        const response = await fetch(indexUrl);
        const index = await response.json();
        const actionFiles = index.actions;

        if (actionFiles.includes(actionFileName)) {
          console.log('Trying to load %s', actionFileName);
          const actionUrl = `actions/${actionFileName}`;
          [results] = await injectScriptFile({tabId: tab.id}, actionUrl);
        } else {
          console.error(
              `[service-worker.js] No matching file found for ${brand}.${action}.${functionName}`);
        }
        return;
      } catch (e) {
        console.error(
            `[service-worker.js] Error loading action ${brand}.${action}.${functionName}:`,
            e);
        return;
      }
      console.log('[service-worker.js] Results', results);

      // port.postMessage(
      //      {from: 'service-worker', message: results?.result, action});
      return;
    }

    const parts = message.split(/-/);
    let [action] = parts;
    switch (action) {
      case 'getAllForms':
        [results] = await executeScript({tabId: tab.id}, getAllForms);
        break;
      case 'getAllFormNames':
        [results] = await executeScript({tabId: tab.id}, getAllFormNames);
        break;

      case 'getAllFormElements':
        [results] = await executeScript({tabId: tab.id},
            getAllFormElementsWithName);
        break;

      case 'getAllFormElementsWithoutName':
        [results] = await executeScript({tabId: tab.id},
            getAllFormElementsWithoutName);
        break;

      default:
        return;
    }

    console.log('[service-worker.js] Results', results);
    port.postMessage({from: 'service-worker', message: results.result, action});
  });

});

/**
 * Gets all the form names on the current opened tab.
 * @returns {{forms: *[]}}
 */
const getAllFormNames = () => {
  const forms = [...document.forms];

  let namedForms = [];
  forms.forEach((form) => {
    if (form.name && form.name.trim() !== '') {
      namedForms = [...namedForms, form.name];
    }
  });
  return {forms: namedForms};
};

/**
 * Gets all the forms on the current opened tab.
 * @returns {{forms: *[]}}
 */
const getAllForms = () => {
  return {forms: [...document.forms]};
};

/**
 * Get all forms without a name in current opened tab.
 * @returns {{forms: *[]}}
 */
const getAllFormElementsWithoutName = () => {
  const forms = [...document.forms];
  let results = [];

  forms.forEach((f) => {
    const formElements = [...f.elements];
    let elementList = [];

    formElements.forEach((el) => {
      if (!el.name || el.name.trim() === '') {
        if (el.tagName.toLowerCase() !== 'fieldset') {
          elementList.push({
            tag: el.tagName.trim(),
            text: el.textContent.trim(),
            html: el.innerHTML.toString().trim(),
            id: el.id,
            classList: el.classList.toString().trim(),
            type: el.type,
          });
        }
      }
    });

    results.push({form: f.name, elements: elementList});
  });

  return {forms: results};
};

/**
 * Get all elements in forms that contain a 'name' attribute
 * @returns {{forms: *[]}}
 */
const getAllFormElementsWithName = () => {
  const forms = [...document.forms];
  let results = [];

  forms.forEach((f) => {
    const formElements = [...f.elements];
    let elementList = [];

    formElements.forEach((el) => {
      if (el.name || el.name.trim() !== '') {
        if (el.tagName.toLowerCase() !== 'fieldset') {
          elementList.push({
            tag: el.tagName.trim(),
            name: el.name.trim(),
            text: el.textContent.trim(),
            html: el.innerHTML.toString().trim(),
            id: el.id,
            classList: el.classList.toString().trim(),
            type: el.type,
          });
        }
      }
    });

    results.push({form: f.name, elements: elementList});
  });

  // console.log('[service-worker.js] Results:', {forms: results});
  return {forms: results};
};

/**
 * Fill out the vehicle form
 * @async
 * @param {boolean} submit
 * @returns {Promise<void>}
 */
const fillVehiclePage = async (submit) => {
  const f = window.FormFiller ? window.FormFiller : new FormFiller();

// Select vehicle
// Commenting this rather than leaving in the event we go back to using dropdowns.
//
//   setTimeout(async () => await f.selectDropdownByLabel('year', '2021'), 500);
//   setTimeout(async () => await f.selectDropdownByLabel('make', 'CHEVROLET'),
//       2500);
//   setTimeout(
//       async () => await f.selectDropdownByLabel('model', 'EQUINOX LT 4DR AWD'),
//       3500);

  let dropdown;
  setTimeout(async () => {
    await f.typeField('year', '2021');
    dropdown = document.querySelectorAll('.dropdown-item');
    await f.clickElement(dropdown[0]);

  }, 500);

  setTimeout(async () => {
    await f.typeField('make', 'CHEVROLET');
    dropdown = document.querySelectorAll('.dropdown-item');
    await f.clickElement(dropdown[0]);

  }, 2500);

  setTimeout(async () => {
    await f.typeField('model', 'EQUINOX LT 4DR AWD');
    dropdown = document.querySelectorAll('.dropdown-item');
    await f.clickElement(dropdown[0]);
  }, 3500);

// Select address
  setTimeout(async () => await f.clickElement(
      '[name=addressBook] .dropdown .dropdown-toggle'), 4500);
  setTimeout(async () => await f.clickElement(
      '[name=addressBook] .dropdown .dropdown-menu span'), 5500);

// Enter address
  setTimeout(async () => await f.typeField('line1', 'AAAAAAAAAAAAAAAAAAAAAAA'),
      6000);
  setTimeout(
      async () => await f.clickElement('.modal-footer button[type=submit]'),
      7000);

// Enter leasing info
  await f.selectRadioByValue('isLeased', false);
  await f.selectRadioByValue('purchasedNew', false);

// Select purchase info
  await f.selectDropdownByLabel('purchasedDate-month', 'January');
  await f.selectDropdownByLabel('purchasedDate-day', '1');
  await f.selectDropdownByLabel('purchasedDate-year', '2022');

// Primary Use
  setTimeout(async () => await f.selectRadioByValue('primaryUse', 'Pleasure'),
      7000);

// Annual Distance
  let d = document.querySelector('input[type=number][name=annualDistance]');
  await f.typeField(d, '16000');

// Compensation
  setTimeout(
      async () => await f.selectRadioByValue('isCompensatedDriving', false),
      7500);

// Tires
  setTimeout(async () => await f.selectRadioByValue('winterTires', true), 8000);

  if (submit) {
    setTimeout(async () => await f.clickElement(
        'form[name=vehicleForm] button[type=submit]'), 10000);
  }
};

/**
 *
 * @returns {Promise<void>}
 */
const fillDriverPage = async (submit) => {
  const f = new FormFiller();

  await f.typeField('firstName', 'Driver');
  await f.typeField('lastName', 'Test');
  await f.selectRadioByValue('gender', 'unspecified');
  await f.selectDropdownByLabel('birthDate-month', 'January');
  await f.selectDropdownByLabel('birthDate-day', '1');
  await f.selectDropdownByLabel('birthDate-year', '2000');
  await f.selectRadioByLabel('maritalStatus', 'married');
  await f.selectRadioByLabel('jobStatus', 'employed');
  await f.selectDropdownByLabel('licensedDate-month', 'January');
  await f.selectDropdownByLabel('licensedDate-day', '1');
  await f.selectDropdownByValue('licensedDate-year',
      `number:${(new Date()).getFullYear()}`);
  await f.selectRadioByValue('hadEverInsuranceAuto', false);

  if (submit) {
    setTimeout(async () => await f.clickElement(
        'form[name=driverForm] button[type=submit]'), 3000);
  }
};