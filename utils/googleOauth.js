import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function getProfileInfo(credential) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Extract first and last name from the name
    let firstName = payload.given_name || "";
    let lastName = payload.family_name || "";

    // If given_name and family_name are not available, split the full name
    if (!firstName && payload.name) {
      const nameParts = payload.name.split(" ");
      firstName = nameParts[0] || "";
      lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    }

    // Return a properly formatted profile with separate firstName and lastName
    return {
      sub: payload.sub, // Google's unique identifier
      email: payload.email,
      firstName: firstName,
      lastName: lastName,
      name: payload.name,
      picture: payload.picture,
      email_verified: payload.email_verified,
    };
  } catch (error) {
    console.error("Error verifying Google token:", error);
    throw error;
  }
}
