import { createAnimation } from '@ionic/react';

export const animationBuilder = (baseEl: any, opts: { enteringEl: Element | Node | Element[] | Node[] | NodeList; leavingEl: Element | Node | Element[] | Node[] | NodeList }) => {
  const enteringAnimation = createAnimation().addElement(opts.enteringEl).fromTo('opacity', 0, 1).duration(400);

  const leavingAnimation = createAnimation().addElement(opts.leavingEl).fromTo('opacity', 1, 0).duration(400);

  const animation = createAnimation().addAnimation(enteringAnimation).addAnimation(leavingAnimation);

  return animation;
};
