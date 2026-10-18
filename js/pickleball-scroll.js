import { createPickleball } from '../hyperframes/assets/pickleball-3d.js';

const stage = document.getElementById('pickleballStage');
const canvas = document.getElementById('pickleballCanvas');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (stage && canvas) {
  let player = null;
  try {
    player = createPickleball(canvas);
    stage.classList.add('is-ready');
  } catch (error) {
    canvas.hidden = true;
  }

  if (!reducedMotion) {
    let target = 0;
    let current = 0;
    let frame = 0;

    function updateTarget() {
      const travel = Math.max(window.innerHeight * 2.2, 1);
      target = Math.max(0, Math.min(1, window.scrollY / travel));
      if (!frame) frame = requestAnimationFrame(render);
    }

    function render() {
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.001) current = target;
      if (player) player.renderAt(current);
      stage.style.transform = 'translate3d(' + (-current * 64).toFixed(1) + 'px,' +
        (-current * 92).toFixed(1) + 'px,0) scale(' + (1 + current * 0.16).toFixed(3) + ')';
      stage.style.opacity = String(1 - current * 0.55);
      document.documentElement.style.setProperty('--image-y',
        (window.innerWidth <= 700 ? 52 + current * 14 : 68 + current * 20).toFixed(1) + '%');
      frame = current === target ? 0 : requestAnimationFrame(render);
    }

    window.addEventListener('scroll', updateTarget, { passive: true });
    window.addEventListener('resize', function () {
      if (player) player.resize();
      updateTarget();
    });
    updateTarget();
  }
}
