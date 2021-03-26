/* eslint-disable */
import { createAnimation } from '@ionic/core/dist/collection/utils/animation/animation';
/**
 * Md Alert Leave Animation
 */
export const mdLeaveAnimation = (baseEl: HTMLElement) => {
  const baseAnimation = createAnimation();
  const backdropAnimation = createAnimation();
  const wrapperAnimation = createAnimation();
  backdropAnimation
    .addElement(baseEl.querySelector('ion-backdrop'))
    .fromTo('opacity', 'var(--backdrop-opacity)', 0);
  wrapperAnimation
    .addElement(baseEl.querySelector('.modal-wrapper'))
    .fromTo('opacity', 0.99, 0);
  return baseAnimation
    .addElement(baseEl)
    .easing('ease-in-out')
    .duration(150)
    .addAnimation([backdropAnimation, wrapperAnimation]);
};
