/**
 * WebAuthn / Biometric authentication utilities for VoteSphere.
 * Wraps the browser's navigator.credentials API with clean helpers.
 */

function b64urlToBuffer(b64url: string): ArrayBuffer {
  const padding = "=".repeat((4 - (b64url.length % 4)) % 4);
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + padding;
  const binary = atob(b64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  return buffer;
}

function bufferToB64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.PublicKeyCredential &&
    typeof navigator.credentials?.create === "function"
  );
}

export async function isBiometricAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/** Register a new biometric credential using the server challenge */
export async function registerBiometric(challenge: any): Promise<{
  credential_id: string;
  public_key: string;
  client_data_json: string;
  attestation_object: string;
}> {
  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge: b64urlToBuffer(challenge.challenge),
    rp: challenge.rp,
    user: {
      id: b64urlToBuffer(challenge.user.id),
      name: challenge.user.name,
      displayName: challenge.user.displayName,
    },
    pubKeyCredParams: challenge.pubKeyCredParams,
    authenticatorSelection: challenge.authenticatorSelection,
    timeout: challenge.timeout,
    attestation: challenge.attestation,
  };

  const credential = (await navigator.credentials.create({
    publicKey,
  })) as PublicKeyCredential;

  if (!credential) throw new Error("Biometric registration cancelled");

  const response = credential.response as AuthenticatorAttestationResponse;

  return {
    credential_id: bufferToB64url(credential.rawId),
    public_key: bufferToB64url(response.getPublicKey?.() || new ArrayBuffer(0)),
    client_data_json: bufferToB64url(response.clientDataJSON),
    attestation_object: bufferToB64url(response.attestationObject),
  };
}

/** Authenticate using an existing biometric credential */
export async function authenticateBiometric(challenge: any): Promise<{
  credential_id: string;
  authenticator_data: string;
  signature: string;
  client_data_json: string;
}> {
  const allowCredentials = (challenge.allowCredentials || []).map((c: any) => ({
    type: "public-key" as const,
    id: b64urlToBuffer(c.id),
  }));

  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge: b64urlToBuffer(challenge.challenge),
    timeout: challenge.timeout,
    rpId: challenge.rpId,
    userVerification: challenge.userVerification,
    allowCredentials,
  };

  const assertion = (await navigator.credentials.get({
    publicKey,
  })) as PublicKeyCredential;

  if (!assertion) throw new Error("Biometric authentication cancelled");

  const response = assertion.response as AuthenticatorAssertionResponse;

  return {
    credential_id: bufferToB64url(assertion.rawId),
    authenticator_data: bufferToB64url(response.authenticatorData),
    signature: bufferToB64url(response.signature),
    client_data_json: bufferToB64url(response.clientDataJSON),
  };
}
