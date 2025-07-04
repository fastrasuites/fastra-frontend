import React, { useRef, useState, useEffect } from "react";
import "./CustomScrollContainer.css";

const CustomScrollContainer = ({ children, maxHeight }) => {
  const containerRef = useRef(null);
  const [thumbTop, setThumbTop] = useState(0);
  const fixedThumbHeight = 30; // Fixed thumb height

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateThumbPosition = () => {
      const { scrollTop, clientHeight, scrollHeight } = container;
      console.log("scrollTop:", scrollTop, "clientHeight:", clientHeight, "scrollHeight:", scrollHeight);
      // Only update if content overflows
      if (scrollHeight <= clientHeight) {
        setThumbTop(10);
        return;
      }
      const trackHeight = clientHeight - 20; // 10px top and bottom margins
      const scrollRatio = scrollTop / (scrollHeight - clientHeight);
      const newThumbTop = 10 + scrollRatio * (trackHeight - fixedThumbHeight);
      console.log("newThumbTop:", newThumbTop);
      setThumbTop(newThumbTop);
    };

    updateThumbPosition();
    container.addEventListener("scroll", updateThumbPosition);
    window.addEventListener("resize", updateThumbPosition);
    return () => {
      container.removeEventListener("scroll", updateThumbPosition);
      window.removeEventListener("resize", updateThumbPosition);
    };
  }, [fixedThumbHeight]);

  return (
    <div className="custom-scroll-container" ref={containerRef} style={{ maxHeight }}>
      {children}
      <div className="fake-scrollbar-track">
        <div
          className="fake-scrollbar-thumb"
          style={{ height: `${fixedThumbHeight}px`, top: `${thumbTop}px` }}
        />
      </div>
    </div>
  );
};

export default CustomScrollContainer;
