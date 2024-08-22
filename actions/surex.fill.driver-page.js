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
 * main
 * @async
 * @returns {Promise<void>}
 */
const fillDriverPage = async () => {
  const f = window.FormFiller ? window.FormFiller : new FormFiller();

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
};

fillDriverPage();
