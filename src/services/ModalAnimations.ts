import { createAnimation } from '@ionic/vue';

type Mode = 'ios' | 'md';

const getElements = (baseEl: HTMLElement) => {
  const root = (baseEl as any).shadowRoot ?? baseEl;
  const backdrop = root.querySelector('ion-backdrop') as HTMLElement | null;
  const wrapper = root.querySelector('.modal-wrapper, .ion-page, .modal-content') as HTMLElement | null;
  return { backdrop, wrapper };
};

const buildAnimation = (baseEl: HTMLElement, entering: boolean) => {
  const mode: Mode = (baseEl.getAttribute('mode') as Mode) === 'ios' ? 'ios' : 'md';
  const { backdrop, wrapper } = getElements(baseEl);

  if (!wrapper) {
    return createAnimation();
  }

  const duration = mode === 'ios' ? 320 : 280;
  const easing = mode === 'ios' ? 'cubic-bezier(0.36,0.66,0.04,1)' : 'cubic-bezier(0.4,0,0.2,1)';

  const backdropAnimation = backdrop
    ? createAnimation()
        .addElement(backdrop)
        .fromTo('opacity', entering ? '0.01' : getComputedStyle(backdrop).opacity || '0.4', entering ? '0.4' : '0')
    : undefined;

  const translateY = mode === 'ios' ? '100px' : '40px';

  const wrapperAnimation = createAnimation()
    .addElement(wrapper)
    .keyframes(
      entering
        ? [
            { offset: 0, opacity: 0.01, transform: `translateY(${translateY}) scale(0.98)` },
            { offset: 1, opacity: 1, transform: 'translateY(0) scale(1)' },
          ]
        : [
            { offset: 0, opacity: 1, transform: 'translateY(0) scale(1)' },
            { offset: 1, opacity: 0, transform: `translateY(${translateY}) scale(0.98)` },
          ]
    );

  const animation = createAnimation()
    .addElement(baseEl)
    .easing(easing)
    .duration(duration)
    .addAnimation(wrapperAnimation);

  if (backdropAnimation) {
    animation.addAnimation(backdropAnimation);
  }

  return animation;
};

export const modalEnterAnimation = (baseEl: HTMLElement) => buildAnimation(baseEl, true);

export const modalLeaveAnimation = (baseEl: HTMLElement) => buildAnimation(baseEl, false);
