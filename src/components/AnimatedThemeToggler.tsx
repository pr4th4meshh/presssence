"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";

type Props = {
  className?: string;
};

export const AnimatedThemeToggler = ({ className }: Props) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const changeTheme = async () => {
    if (!buttonRef.current) return;

    const newTheme = resolvedTheme === "dark" ? "light" : "dark";

    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    }).ready;

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const y = top + height / 2;
    const x = left + width / 2;

    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRad}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  };

  return (
    <button ref={buttonRef} onClick={changeTheme} className={cn(className)}>
      {resolvedTheme === "dark" ? (
        <IoSunnyOutline />
      ) : (
        <IoMoonOutline className="text-black dark:text-white" />
      )}
    </button>
  );
};
