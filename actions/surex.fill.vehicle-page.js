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

/**
 * Fill out the vehicle form
 * @async
  * @returns {Promise<void>}
 */
const fillVehiclePage = async () => {
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
};

fillVehiclePage();
