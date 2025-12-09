export function registerSW() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => console.log("SW Registered"))
        .catch((err) => console.log("SW Registration Failed", err));
    });
  }
}
