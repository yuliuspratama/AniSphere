"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only register service worker in production
    const isProduction = process.env.NODE_ENV === "production";

    if ("serviceWorker" in navigator) {
      if (isProduction) {
        // Register service worker in production
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
              console.log("Service Worker registered:", registration.scope);
            })
            .catch((error) => {
              console.log("Service Worker registration failed:", error);
            });
        });
      } else {
        // Unregister service worker in development to prevent caching issues
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
            console.log("Service Worker unregistered for development");
          }
        });
      }
    }
  }, []);

  return null;
}

