import { type RefObject, useEffect, useState } from "react";

export function useVisibleAction(
  subject: RefObject<HTMLElement | null>,
  root?: RefObject<HTMLElement | null>,
  onVisibilityChange?: (is_visible: boolean) => void,
) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!root || !subject.current) {
      return;
    }

    const scrollObserver = new IntersectionObserver(
      (entries) => {
        setVisible(entries[0].intersectionRatio >= 0);
      },
      { root: root?.current },
    );

    scrollObserver.observe(subject.current);

    return () => scrollObserver.disconnect();
  }, [root, subject]);

  useEffect(() => {
    onVisibilityChange?.(visible);
  }, [visible, onVisibilityChange]);

  return visible;
}
