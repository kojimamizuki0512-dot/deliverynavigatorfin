// frontend/src/components/ui/GlassCard.jsx
import React from "react";

export default function GlassCard({ className = "", children }) {
  return (
    <section className={`glass p-4 md:p-5 ${className}`}>
      {children}
    </section>
  );
}
