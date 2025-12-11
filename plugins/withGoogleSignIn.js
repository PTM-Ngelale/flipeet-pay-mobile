const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withGoogleSignIn(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const { manifest } = androidManifest;

    if (!manifest.application) {
      manifest.application = [{}];
    }

    const application = manifest.application[0];

    if (!application.activity) {
      application.activity = [];
    }

    // Add Google Sign-In Hub Activity
    const googleSignInActivity = {
      $: {
        "android:name": "com.google.android.gms.auth.api.signin.internal.SignInHubActivity",
        "android:exported": "true",
      },
      "intent-filter": [
        {
          action: [
            {
              $: {
                "android:name": "android.intent.action.VIEW",
              },
            },
          ],
          category: [
            {
              $: {
                "android:name": "android.intent.category.DEFAULT",
              },
            },
            {
              $: {
                "android:name": "android.intent.category.BROWSABLE",
              },
            },
          ],
          data: [
            {
              $: {
                "android:scheme": "com.googleusercontent.apps.289967638710-ek2k5v76t6sbcih4gv9v45qhd949r0rh",
                "android:host": "oauth2redirect",
              },
            },
          ],
        },
      ],
    };

    // Check if activity already exists
    const existingActivity = application.activity.find(
      (activity) =>
        activity.$?.["android:name"] ===
        "com.google.android.gms.auth.api.signin.internal.SignInHubActivity"
    );

    if (!existingActivity) {
      application.activity.push(googleSignInActivity);
    }

    return config;
  });
};
