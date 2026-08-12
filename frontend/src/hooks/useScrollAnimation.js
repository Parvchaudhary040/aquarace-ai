import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimation(ref, animationType = 'fadeUp', options = {}) {
  useEffect(() => {
    if (!ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const element = ref.current;
    let ctx = gsap.context(() => {
      if (animationType === 'fadeUp') {
        gsap.fromTo(
          element,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              ...options,
            },
          }
        );
      } else if (animationType === 'parallax') {
        gsap.to(element, {
          y: options.speed ? options.speed * -50 : -30,
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            ...options,
          },
        });
      } else if (animationType === 'scaleUp') {
        gsap.fromTo(
          element,
          { opacity: 0, scale: 0.92 },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
              ...options,
            },
          }
        );
      }
    }, element);

    return () => ctx.revert();
  }, [ref, animationType]);
}
