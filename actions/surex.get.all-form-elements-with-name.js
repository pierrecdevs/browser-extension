/*
 * Copyright (c) 2024 Pierre C.
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
 * Get all elements in forms that contain a 'name' attribute
 * @returns {{forms: *[]}}
 */
export const getAllFormElementsWithName = () => {
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