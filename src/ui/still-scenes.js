import gsap from 'gsap';

// Two complete paintings dissolve together, including consecutive chapters
// that used to share a single DOM background. Never animate the character alone.
export function createStillScenes(world) {
  const frames = Array.from({ length:2 }, () => {
    const frame = document.createElement('div');
    frame.className = 'still-scene';
    world.prepend(frame);
    gsap.set(frame, { opacity:0 });
    return frame;
  });
  let current = 0, url, transition;
  world.dataset.sceneTransition = 'idle';
  return {
    show(next, { immediate = false, direction = 1 } = {}) {
      if (next === url) {
        if (immediate) {
          transition?.kill();
          world.dataset.sceneTransition = 'idle';
          gsap.set(frames[current], { opacity:1, yPercent:0 });
          gsap.set(frames[1-current], { opacity:0, yPercent:0 });
        }
        return;
      }
      transition?.kill();
      const outgoing = frames[current], incoming = frames[1-current];
      incoming.style.backgroundImage = `url("${next}")`;
      // Stack the incoming image above the outgoing one for a true dissolve.
      incoming.style.zIndex = '1'; outgoing.style.zIndex = '0';
      if (immediate || !url) {
        world.dataset.sceneTransition = 'idle';
        gsap.set(outgoing, { opacity:0, yPercent:0 });
        gsap.set(incoming, { opacity:1, yPercent:0 });
      } else {
        world.dataset.sceneTransition = 'running';
        gsap.set(outgoing, { opacity:1 });
        gsap.set(incoming, { opacity:0, yPercent:direction * 1.2 });
        transition = gsap.timeline({ onComplete:() => { world.dataset.sceneTransition = 'idle'; }, defaults:{ duration:1.05, ease:'power2.inOut' } })
          .to(incoming, { opacity:1, yPercent:0 }, .1)
          .to(outgoing, { opacity:0,yPercent:-direction * .6,duration:.85 }, 0)
          .set(outgoing, { opacity:0, yPercent:0 });
      }
      current = 1-current; url = next;
    },
  };
}
