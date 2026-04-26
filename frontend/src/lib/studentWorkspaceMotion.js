export const SHELL_EASE = [0.16, 1, 0.3, 1];

export const pageTransition = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: SHELL_EASE } },
};
