import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

import {
  prepforgeAuthAdditionalFields,
  prepforgeAuthBasePath,
} from "./constants";

type CreatePrepforgeReactAuthClientOptions = {
  baseURL?: string;
};

export function createPrepforgeReactAuthClient({
  baseURL = prepforgeAuthBasePath,
}: CreatePrepforgeReactAuthClientOptions = {}) {
  return createAuthClient({
    baseURL,
    fetchOptions: {
      credentials: "include",
    },
    plugins: [inferAdditionalFields(prepforgeAuthAdditionalFields)],
  });
}

