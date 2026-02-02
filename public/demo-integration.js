/**
 * Escourtly Demo Integration Script
 *
 * This script should be added to your demo dashboard page to enable
 * integration with the landing page's interactive demo iframe.
 *
 * Features:
 * - Listen for postMessage events from parent window
 * - Clear localStorage when demo is reloaded
 * - Trigger Escourtly tours programmatically
 * - Notify parent when demo is ready
 */

(function initDemoIntegration() {
  const ESCOURTLY_KEYS = [
    "escourtly_state", // Frequency/interaction state
    "escourtly_active_guide", // Active guide state
    "escourtly_aid", // Anonymous ID
  ];

  /**
   * Clear all Escourtly localStorage data
   */
  function clearEscourtlyState() {
    ESCOURTLY_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
        // console.log(`[DemoIntegration] Cleared ${key}`);
      } catch (error) {
        // console.warn(`[DemoIntegration] Failed to clear ${key}:`, error);
      }
    });
  }

  /**
   * Trigger a specific Escourtly guide
   * @param {string} guideId - Guide ID to trigger (or 'auto' for page-matched guide)
   */
  function triggerEscourtlyTour(guideId) {
    if (!window.EscourtlySDK) {
      // console.warn("[DemoIntegration] Escourtly SDK not loaded yet");
      return;
    }

    // Clear state first to ensure fresh experience
    clearEscourtlyState();

    if (guideId === "auto") {
      // Let SDK automatically trigger guides for this page
      // console.log("[DemoIntegration] Triggering automatic guide");
      // Force page reload to trigger automatic guides
      window.location.reload();
    } else {
      // Trigger specific guide
      // console.log("[DemoIntegration] Triggering guide:", guideId);

      // Use the SDK's restart method if available
      if (typeof window.EscourtlySDK.restartGuide === "function") {
        window.EscourtlySDK.restartGuide(guideId);
      } else {
        // console.warn("[DemoIntegration] SDK restartGuide method not available");
      }
    }
  }

  /**
   * Handle postMessage events from parent window
   */
  function handleParentMessage(event) {
    // SECURITY: In production, verify event.origin
    // if (event.origin !== 'https://your-domain.com') return;

    const { type, guideId } = event.data;

    switch (type) {
      case "START_DEMO_TOUR":
        // console.log("[DemoIntegration] Received START_DEMO_TOUR command");
        triggerEscourtlyTour(guideId || "auto");
        break;

      case "CLEAR_DEMO_STATE":
        // console.log("[DemoIntegration] Received CLEAR_DEMO_STATE command");
        clearEscourtlyState();
        break;

      default:
        // Ignore unknown messages
        break;
    }
  }

  /**
   * Notify parent window that demo is ready
   */
  function notifyParentReady() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "DEMO_READY" }, "*");
      // console.log("[DemoIntegration] Notified parent: DEMO_READY");
    }
  }

  /**
   * Notify parent when tour is completed
   */
  function notifyTourCompleted() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "TOUR_COMPLETED" }, "*");
      // console.log("[DemoIntegration] Notified parent: TOUR_COMPLETED");
    }
  }

  // Initialize
  // console.log("[DemoIntegration] Initializing demo integration...");

  // 🎯 DEMO MODE: Auto-clear guide state on every page load
  // This ensures the demo guide always appears fresh for every visitor,
  // even if they completed it before or are returning to the demo
  // console.log("[DemoIntegration] Auto-clearing guide state for fresh demo experience");
  clearEscourtlyState();

  // Listen for postMessage from parent
  window.addEventListener("message", handleParentMessage);

  // Notify parent when page is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", notifyParentReady);
  } else {
    notifyParentReady();
  }

  // Optional: Listen for Escourtly tour completion
  // This requires the SDK to dispatch custom events (you may need to modify SDK)
  window.addEventListener("escourtly:tour:completed", notifyTourCompleted);

  // console.log("[DemoIntegration] Demo integration ready");

  // Expose utilities for debugging
  window.__demoIntegration = {
    clearState: clearEscourtlyState,
    triggerTour: triggerEscourtlyTour,
    notifyParent: notifyParentReady,
  };
})();
