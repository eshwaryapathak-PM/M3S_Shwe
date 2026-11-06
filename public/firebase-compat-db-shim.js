/**
 * Firebase Compat Multiple Databases Workaround Shim (Google AI Studio Build)
 *
 * This shim resolves the limitation of some older compatibility layers by intercepting
 * calls to firebase.app().firestore() and automatically forwarding the configured
 * firestoreDatabaseId options field as the database ID to the native firebase-firestore-compat.js
 * instance. This aligns perfectly with the active compat Firebase Auth state.
 */

(function() {
  if (typeof window.firebase !== 'undefined') {
    
    // Inject custom database parameter resolution on top of native .firestore() compat API
    const patchAppInstance = (appInstance) => {
      if (appInstance && !appInstance._firestoreDatabasePatched) {
        appInstance._firestoreDatabasePatched = true;
        
        // Save the original firestore implementation on the app instance or prototype
        const originalFirestore = appInstance.firestore;
        
        if (typeof originalFirestore === 'function') {
          appInstance.firestore = function(databaseId) {
            const config = appInstance.options || {};
            const defaultDbId = config.firestoreDatabaseId;
            // Native firebase compat supports .firestore(databaseId).
            // We pass databaseId if called with one, otherwise fallback to configured firestoreDatabaseId (excluding default).
            const targetDbId = databaseId || (defaultDbId && defaultDbId !== '(default)' ? defaultDbId : undefined);
            
            console.log(`🔥 [Firebase Compat Shim] Resolving firestore with databaseId: ${targetDbId || '(default)'}`);
            if (targetDbId && typeof appInstance._getService === 'function') {
              try {
                return appInstance._getService('firestore', targetDbId);
              } catch (err) {
                console.warn("🔥 [Firebase Compat Shim] _getService for firestore failed, falling back to original:", err);
              }
            }
            return originalFirestore.call(this, targetDbId);
          };
        } else {
          // If the firestore method is not registered yet, configure a lazy dynamic getter
          Object.defineProperty(appInstance, 'firestore', {
            configurable: true,
            writable: true,
            value: function(databaseId) {
              const proto = Object.getPrototypeOf(appInstance);
              const protoFirestore = proto && proto.firestore;
              
              if (typeof protoFirestore === 'function') {
                const config = appInstance.options || {};
                const defaultDbId = config.firestoreDatabaseId;
                const targetDbId = databaseId || (defaultDbId && defaultDbId !== '(default)' ? defaultDbId : undefined);
                
                console.log(`🔥 [Firebase Compat Shim] Resolving lazy firestore with databaseId: ${targetDbId || '(default)'}`);
                if (targetDbId && typeof appInstance._getService === 'function') {
                  try {
                    return appInstance._getService('firestore', targetDbId);
                  } catch (err) {
                    console.warn("🔥 [Firebase Compat Shim] lazy _getService for firestore failed, falling back to proto:", err);
                  }
                }
                return protoFirestore.call(this, targetDbId);
              }
              
              throw new Error("Firebase Firestore Compat SDK is not loaded. Please ensure firebase-firestore-compat.js script is loaded.");
            }
          });
        }
      }
      return appInstance;
    };

    // Patch any already initialized apps
    if (window.firebase.apps) {
      window.firebase.apps.forEach(patchAppInstance);
    }

    // Intercept future app container retrievals
    const originalApp = window.firebase.app;
    window.firebase.app = function(...args) {
      return patchAppInstance(originalApp.apply(this, args));
    };

    // Intercept future initializations
    const originalInitializeApp = window.firebase.initializeApp;
    window.firebase.initializeApp = function(...args) {
      return patchAppInstance(originalInitializeApp.apply(this, args));
    };

    console.log("🔥 [Firebase Compat Shim] Successfully applied native firebase.firestore() interception!");
  } else {
    console.error("🔥 [Firebase Compat Shim] Error: Firebase Compat core SDK was not loaded before shim injection.");
  }
})();
