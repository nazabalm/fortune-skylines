'use client'

import Lottie from "lottie-react";
import animationData from "../../public/animations/animation.json";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Lottie
        animationData={animationData}
        loop={true}
        style={{ width: 400, height: 400 }}
      />
    </div>
  );
}
