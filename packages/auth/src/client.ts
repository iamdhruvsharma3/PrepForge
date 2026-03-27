import { createAuthClient } from "better-auth/client";
import { inferAdditionalFields } from "better-auth/client/plugins";

import {
  prepforgeAuthAdditionalFields,
  prepforgeAuthBasePath,
} from "./constants";

type CreatePrepforgeAuthClientOptions = {
  baseURL?: string;
  disableDefaultFetchPlugins?: boolean;
};

export function createPrepforgeAuthClient({
  baseURL = prepforgeAuthBasePath,
  disableDefaultFetchPlugins = false,
}: CreatePrepforgeAuthClientOptions = {}) {
  return createAuthClient({
    baseURL,
    disableDefaultFetchPlugins,
    fetchOptions: {
      credentials: "include",
    },
    plugins: [inferAdditionalFields(prepforgeAuthAdditionalFields)],
  });
}

