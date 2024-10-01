import { useEffect, useState } from "react"
import http from "@/config/http"

const useFetchOrgCustomers = (organizationId: string, accessToken: string) => {
  const [orgCustomers, setOrgCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null) // Reset error state before fetching
      const response = await http.get(
        `/organization/${organizationId}/customers`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      setOrgCustomers(response.data)
    } catch (err) {
      setError(err) // Set the error state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (organizationId && accessToken) {
      fetchCustomers()
    }
  }, [organizationId, accessToken]) // Fetch when organizationId or accessToken changes

  return { orgCustomers, loading, error, refetch: fetchCustomers }
}

export default useFetchOrgCustomers
