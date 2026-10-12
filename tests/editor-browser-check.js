// Run on a clean localhost desktop page: paste this file into the browser console.
// Exercises the real editor without saving or modifying src/data/layout.json.
(async () => {
  const assert = (ok, message) => { if (!ok) throw new Error(message); };
  const settle = () => new Promise(resolve => setTimeout(resolve, 50));
  const menu = document.querySelector('.layout-editor');
  assert(menu && innerWidth >= 768, 'Open the local desktop site first');
  const button = text => [...menu.querySelectorAll('button')].find(b => b.textContent === text);
  if (button('Expand')) { button('Expand').click(); await settle(); }
  if (button('Edit layout')) { button('Edit layout').click(); await settle(); }
  assert(button('Discard').disabled, 'Save or discard existing edits before running this check');
  const move = menu.querySelector('[aria-label="Move edit menu"]');
  const key = async name => {
    move.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
    await settle();
  };
  const start = menu.getBoundingClientRect();
  await key('ArrowRight');
  assert(menu.getBoundingClientRect().left > start.left, 'Keyboard movement must move the menu');
  button('Collapse').click(); await settle();
  const expand = button('Expand');
  assert(expand.getAttribute('aria-expanded') === 'false', 'Collapsed state must be accessible');
  assert(document.getElementById(expand.getAttribute('aria-controls')).hidden, 'Controls must be hidden');
  assert(menu.getBoundingClientRect().height < start.height, 'Collapsing must clear the scene');
  button('Expand').click(); await settle();
  assert(button('Done editing'), 'Collapsing must not end editing');
  for (let i = 0; i < 8; i++) await key('ArrowLeft');
  assert(menu.getBoundingClientRect().left >= 8, 'Menu must stay inside the viewport');

  const select = async id => {
    const input = menu.querySelector('select');
    assert([...input.options].some(o => o.value === id), `Missing view-specific option: ${id}`);
    input.value = id;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await settle();
  };
  const xInput = () => menu.querySelector('input[type="number"]');
  const setX = async value => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(xInput(), String(value));
    xInput().dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
  };
  try {
    for (const id of ['keyboard', 'mouse', 'headset', 'duck', 'mug', 'pens']) {
      button('Home view').click(); await settle();
      await select(id);
      const homeX = Number(xInput().value);
      button('Section view').click(); await settle();
      await select(`section-${id}`);
      const sectionX = Number(xInput().value);
      await setX(sectionX + 0.25);
      assert(Number(xInput().value) === Number((sectionX + 0.25).toFixed(3)), 'Section position must change');
      button('Home view').click(); await settle();
      await select(id);
      assert(Number(xInput().value) === homeX, `${id}: section edits must not change home`);
      await setX(homeX - 0.25);
      button('Section view').click(); await settle();
      await select(`section-${id}`);
      assert(Number(xInput().value) === Number((sectionX + 0.25).toFixed(3)), `${id}: home edits must not change section`);
    }
    const cameraValue = label => Number(menu.querySelector(`input[aria-label="${label}"]`).value);
    const setCamera = async (label, value) => {
      const input = menu.querySelector(`input[aria-label="${label}"]`);
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, String(value));
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await settle();
    };
    button('Home view').click(); await settle(); await select('camera-home');
    const homeDefaultAngle = cameraValue('View angle');
    await setCamera('View angle', 25); await setCamera('Camera distance', 9);
    button('Section view').click(); await settle();
    assert(menu.querySelector('select').value === 'camera-section', 'Camera selection must follow the view');
    assert(cameraValue('View angle') === homeDefaultAngle, 'Section camera must not inherit Home edits');
    await setCamera('View angle', -15); await setCamera('Camera distance', 12);
    button('Home view').click(); await settle();
    assert(cameraValue('View angle') === 25 && cameraValue('Camera distance') === 9, 'Home camera must retain its own zoom and angle');
    button('Section view').click(); await settle();
    assert(cameraValue('View angle') === -15 && cameraValue('Camera distance') === 12, 'Section camera must retain its own zoom and angle');
    const canvas = document.querySelector('canvas');
    const beforeZoom = cameraValue('Camera distance');
    canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, clientX: innerWidth / 2, clientY: innerHeight / 2, bubbles: true, cancelable: true }));
    await settle();
    assert(cameraValue('Camera distance') < beforeZoom, 'Scrolling must zoom the actual camera');
    button('Reset view').click(); await settle();
    assert(cameraValue('View angle') === homeDefaultAngle, 'Reset view must restore the Section default');
    button('Home view').click(); await settle();
    assert(cameraValue('View angle') === 25, 'Resetting Section must preserve Home');
  } finally {
    button('Discard').click(); await settle();
    button('Home view').click(); await settle();
    button('Done editing').click(); await settle();
  }
  return 'PASS: editor movement, six independent prop layouts, independent Home/Section cameras, wheel zoom, reset and discard';
})();
