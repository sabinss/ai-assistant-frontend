import http from "@/config/http"

/**
 * Sets up organization data after successful authentication
 * This function calls the same APIs that are called in the settings page
 * to ensure the organization is properly configured
 */
export const setupOrganization = async (accessToken: string) => {
  try {
    // Call the same APIs that are called in settings page
    const [orgResponse, tokenResponse] = await Promise.all([
      // Get organization details
      http.get("/organization/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      // Generate organization token
      http.get("/generate/token", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ])

    return {
      success: true,
      organizationData: orgResponse?.data?.org,
      tokenData: tokenResponse?.data,
      settings: tokenResponse?.data?.settings,
    }
  } catch (error) {
    console.error("Error setting up organization:", error)
    return {
      success: false,
      error: error,
    }
  }
}

/**
 * Sets up organization data and stores it in the appropriate stores
 * This is a higher-level function that handles the complete setup process
 */
export const initializeOrganization = async (
  accessToken: string,
  setOrgToken?: (token: string) => void
) => {
  const result = await setupOrganization(accessToken)

  if (result.success && setOrgToken) {
    // Set the organization token if setter function is provided
    setOrgToken(result.tokenData?.token)
  }

  return result
}
