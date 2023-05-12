import { JsonCredential, Request } from "@henrotaym/api-client";

class Credential extends JsonCredential {
  /**
   * Preparing given request.
   * @param {import('@henrotaym/api-client').Request} request
   */
  prepare(request: Request) {
    super.prepare(request);
    request.setBaseUrl("https://messaging.trustup.io/api");
  }
}

export default Credential;
