const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

admin.initializeApp();

exports.setRoleClaim = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const role = request.data?.role;
  if (!["teacher", "student"].includes(role)) {
    throw new HttpsError("invalid-argument", "Role must be teacher or student.");
  }

  await admin.auth().setCustomUserClaims(request.auth.uid, { role });
  return { success: true, role };
});
