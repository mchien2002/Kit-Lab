import React, { useEffect } from "react";

export default function TestDrag() {
  const handleMouseMove = (event, data) => {
    console.log("move in test");
  };

  useEffect(() => {
    const db = [];

    const eventHandler = (event) => handleMouseMove(event, db);

    window.addEventListener("mousemove", eventHandler);

    return () => {
      window.removeEventListener("mousemove", eventHandler);
    };
  }, []);

  return <div>TestDrag</div>;
}
