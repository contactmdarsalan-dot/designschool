import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

const MOTION_PRESETS = {
  hero: { x: 0, y: 60, scale: 0.985, rotateX: 4 },
  up: { x: 0, y: 72, scale: 0.985, rotateX: 3 },
  left: { x: -72, y: 20, scale: 0.985, rotateX: 0 },
  right: { x: 72, y: 20, scale: 0.985, rotateX: 0 },
  zoom: { x: 0, y: 36, scale: 0.94, rotateX: 0 },
};

const registerPlugin = () => {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
};

export const useSectionReveal = () => {
  const scopeRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    registerPlugin();

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('[data-gsap-section]', scopeRef.current);

      sections.forEach((section, index) => {
        const motionKey = section.dataset.motion || (index % 2 === 0 ? 'up' : 'left');
        const fromVars = MOTION_PRESETS[motionKey] || MOTION_PRESETS.up;
        const items = section.querySelectorAll('[data-gsap-item]');
        const targets = items.length > 0 ? items : [section];
        const media = section.querySelector('[data-gsap-media]');

        gsap.set(section, { transformPerspective: 1200 });

        gsap.fromTo(
          targets,
          {
            autoAlpha: 0,
            x: fromVars.x,
            y: fromVars.y,
            scale: fromVars.scale,
            rotateX: fromVars.rotateX,
            filter: 'blur(12px)',
          },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotateX: 0,
            filter: 'blur(0px)',
            duration: motionKey === 'hero' ? 1.2 : 1,
            ease: 'power3.out',
            stagger: items.length > 1 ? 0.14 : 0,
            scrollTrigger: {
              trigger: section,
              start: motionKey === 'hero' ? 'top 92%' : 'top 84%',
              once: true,
            },
          },
        );

        if (media) {
          gsap.fromTo(
            media,
            {
              yPercent: 10,
              scale: 1.035,
            },
            {
              yPercent: -3,
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
              },
            },
          );
        }
      });

      ScrollTrigger.refresh();
    }, scopeRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return scopeRef;
};

export default useSectionReveal;
