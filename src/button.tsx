"use client";
import { useState } from "react";

export default function Button({ children }: any) {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((cur) => cur + 1)}>
      {children}: {count}
    </button>
  );
}
