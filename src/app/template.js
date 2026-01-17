"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePathname } from "next/navigation";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export default function Template({ children }) {
  const pathname = usePathname();
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(containerRef.current, 
      { opacity: 0, y: 10 }, 
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.5, 
        ease: "power2.out",
        onComplete: () => {
          gsap.set(containerRef.current, { clearProps: "all" });
        }
      }
    );
  }, { scope: containerRef, dependencies: [pathname] });

  return (
    <div ref={containerRef} className="min-h-full w-full">
      {children}
    </div>
  );
}
