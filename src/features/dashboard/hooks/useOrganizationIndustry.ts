"use client"

import { useEffect, useState } from "react"
import useAuth from "@/store/user"
import { fetchOrganizationIndustry } from "../api/organizationIndustry"
import {
  resolveDashboardKind,
} from "../resolveDashboardKind"
import type { DashboardKind } from "../types"

type UseOrganizationIndustryResult = {
  industry: string | null
  dashboardKind: DashboardKind
  loading: boolean
  error: string | null
}

export function useOrganizationIndustry(): UseOrganizationIndustryResult {
  const { access_token, user_data } = useAuth()
  const [industry, setIndustry] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!access_token) {
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const value = await fetchOrganizationIndustry(
          access_token,
          user_data?.organization
        )
        if (!cancelled) setIndustry(value)
      } catch (err) {
        console.error("Failed to load organization industry", err)
        if (!cancelled) {
          setIndustry(null)
          setError("Failed to load organization industry")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [access_token, user_data?.organization])

  return {
    industry,
    dashboardKind: resolveDashboardKind(industry),
    loading,
    error,
  }
}
