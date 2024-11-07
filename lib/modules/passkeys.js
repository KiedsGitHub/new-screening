module.exports = {

  // rpName: User-visible, "friendly" website/service name
  // rpID: Valid domain name (after `https://`)
  // userID: User's website-specific unique ID (must be a string, do not use integer, user GUID instead)
  // userName: User's website-specific username (email, etc...)
  // userDisplayName: User's actual name
  // timeout: How long (in ms) the user can take to complete attestation
  // attestationType: Specific attestation statement
  // excludeCredentials: Authenticators registered by the user so the user can't register the same credential multiple times
  // supportedAlgorithmIDs Array of numeric COSE algorithm identifiers supported for attestation by this RP. See https://www.iana.org/assignments/cose/cose.xhtml#algorithms
  async generateRegistrationOptions (options) {
    const { generateRegistrationOptions } = require('@simplewebauthn/server');
    const rpName = this.parseRequired(options.rpName, 'string', 'passkeys.generateRegistrationOptions: rpName is required.');
    const rpID = this.parseRequired(options.rpID, 'string', 'passkeys.generateRegistrationOptions: rpID is required.');
    const userID = this.parseRequired(options.userID, 'string', 'passkeys.generateRegistrationOptions: userID is required.');
    const userName = this.parseRequired(options.userName, 'string', 'passkeys.generateRegistrationOptions: userName is required.');
    const userDisplayName = this.parseOptional(options.userDisplayName, 'string', '');
    const timeout = this.parseOptional(options.timeout, 'number', 60000);
    const attestationType = this.parseOptional(options.attestationType, 'string', 'none'); // "direct" | "enterprise" | "indirect" | "none"
    const excludeCredentials = this.parseOptional(options.excludeCredentials, 'object', []); // array[{id, transports}]
    const supportedAlgorithmIDs = this.parseOptional(options.supportedAlgorithmIDs, 'object', [-8, -7, -257]) // array[number] (-8 requires Node 18 LTS)
    // authenticator selection criteria (https://simplewebauthn.dev/docs/packages/server#1-generate-registration-options)
    const residentKey = 'preferred'; // "discouraged" | "preferred" | "required"
    const userVerification = 'preferred'; // "discouraged" | "preferred" | "required"

    return await generateRegistrationOptions({
      rpName, rpID, userID, userName, userDisplayName,
      timeout, attestationType, excludeCredentials,
      supportedAlgorithmIDs, authenticatorSelection: {
        residentKey, userVerification,
      },
    });
  },

  // response: Response returned by **@simplewebauthn/browser**'s `startAuthentication()`
  // expectedChallenge: The base64url-encoded `options.challenge` returned by `generateRegistrationOptions()`
  // expectedOrigin: Website URL (or array of URLs) that the registration should have occurred on
  // expectedRPID: RP ID (or array of IDs) that was specified in the registration options
  async verifyRegistrationResponse (options) {
    const { verifyRegistrationResponse } = require('@simplewebauthn/server');
    const response = this.parseRequired(options.response, 'object', 'passkeys.verifyRegistrationResponse: response is required.');
    const expectedChallenge = this.parseRequired(options.expectedChallenge, 'string', 'passkeys.verifyRegistrationResponse: expectedChallenge is required.');
    const expectedOrigin = this.parseRequired(options.expectedOrigin, 'string', 'passkeys.verifyRegistrationResponse: expectedOrigin is required.');
    const expectedRPID = this.parseRequired(options.expectedRPID, 'string', 'passkeys.verifyRegistrationResponse: expectedRPID is required.');

    return await verifyRegistrationResponse({
      response, expectedChallenge, expectedOrigin, expectedRPID,
    });
  },

  // allowCredentials: Authenticators previously registered by the user, if any. If undefined the client will ask the user which credential they want to use
  // timeout: How long (in ms) the user can take to complete authentication
  // userVerification: Set to `'discouraged'` when asserting as part of a 2FA flow, otherwise set to `'preferred'` or `'required'` as desired.
  // rpID: Valid domain name (after `https://`)
  async generateAuthenticationOptions (options) {
    const { generateAuthenticationOptions } = require('@simplewebauthn/server');
    const allowCredentials = this.parseOptional(options.allowCredentials, 'object', undefined);
    const timeout = this.parseOptional(options.timeout, 'number', 60000);
    const userVerification = this.parseOptional(options.userVerification, 'string', 'preferred'); // "discouraged" | "preferred" | "required"
    const rpID = this.parseOptional(options.rpID, 'string', undefined);

    return await generateAuthenticationOptions({
      allowCredentials, timeout, userVerification, rpID,
    });
  },

  // response: Response returned by **@simplewebauthn/browser**'s `startAssertion()`
  // expectedChallenge: The base64url-encoded `options.challenge` returned by `generateAuthenticationOptions()`
  // expectedOrigin: Website URL (or array of URLs) that the registration should have occurred on
  // expectedRPID: RP ID (or array of IDs) that was specified in the registration options
  // authenticator: An internal {@link AuthenticatorDevice} matching the credential's ID
  async verifyAuthenticationResponse (options) {
    const { verifyAuthenticationResponse } = require('@simplewebauthn/server');
    const response = this.parseRequired(options.response, 'object', 'passkeys.verifyAuthenticationResponse: response is required.');
    const expectedChallenge = this.parseRequired(options.expectedChallenge, 'string', 'passkeys.verifyAuthenticationResponse: expectedChallenge is required.');
    const expectedOrigin = this.parseRequired(options.expectedOrigin, 'string', 'passkeys.verifyAuthenticationResponse: expectedOrigin is required.');
    const expectedRPID = this.parseRequired(options.expectedRPID, 'string', 'passkeys.verifyAuthenticationResponse: expectedRPID is required.');
    const authenticator = this.parseRequired(options.authenticator, 'object', 'passkeys.verifyAuthenticationResponse: authenticator is required.')

    return await verifyAuthenticationResponse({
      response, expectedChallenge, expectedOrigin, expectedRPID, authenticator,
    });
  },

};