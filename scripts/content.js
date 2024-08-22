const respond = (tab, data) => {
  chrome.runtime.sendMessage(tab, data, (response) => {
    console.log('[content.js] Response', response);
  });
};

const getAllForms = () => {
  return [...document.forms];
};

const getAllFormElements = () => {

};

const getAllNamedElements = () => {

};

const getAllUnNamedElements = () => {

};
// chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
//   const parts = message.message.split(/-/g);
//   const [page,action] = parts;
//
//   switch(page) {
//     case 'getAllFormElements':
//       sendResponse(getAllForms());
//     break;
//   }
//   console.log('[content.js] Received Message', message);
//   console.log('[content.js] Sender', sender);
//   console.log('[content.js] Page: %s | Action: %s', page, action);
// });

chrome.runtime.onConnect.addEventListener((port) => {
  port.onMessage.addEventListener((message) => {
    const parts = message.message.split(/-/g);
    const [page, action] = parts;

    switch (page) {
      case 'getAllFormElements':
        port.postMessage(getAllForms());
        break;
    }
    console.log('[content.js] Received Message', message);
  });
});

