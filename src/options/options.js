// options.js
import { getStorage, setStorage } from '../utils/storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('enabled-toggle');
  const saveBtn = document.getElementById('save-btn');
  const savedMsg = document.getElementById('saved-msg');

  const data = await getStorage('enabled');
  toggle.checked = data.enabled ?? true;

  saveBtn.addEventListener('click', async () => {
    await setStorage({ enabled: toggle.checked });
    savedMsg.classList.remove('hidden');
    setTimeout(() => savedMsg.classList.add('hidden'), 2000);
  });
});
