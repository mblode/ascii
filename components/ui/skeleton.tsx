"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={cn(
        "rounded-md bg-accent",
        isVisible && "animate-pulse",
        className
      )}
      data-slot="skeleton"
      data-visible={isVisible}
      ref={ref}
      {...props}
    />
  );
}

export { Skeleton };
