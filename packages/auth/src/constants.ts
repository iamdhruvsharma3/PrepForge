export const prepforgeAuthBasePath = "/api/v1/auth";

export const prepforgeAuthAdditionalFields = {
  user: {
    activeWorkspaceId: {
      input: false,
      required: false,
      type: "string",
    },
  },
} as const;

