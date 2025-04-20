import axios from "axios"
import { error } from "console"
const http = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_APP_URL}/${process.env.NEXT_PUBLIC_APP_VERSION}`,
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("error is ", error, error?.response?.status, error?.config?.url)
    const error_code = error?.response?.status
    const requestUrl = error?.config?.url
    // if (error_code === 401) {
    //   window.location.href = '/logout'
    // }
    // Don't redirect for login failure (Invalid password)
    if (error_code === 401 && requestUrl !== "/auth/signin") {
      window.location.href = "/logout"
      return Promise.reject(error)
    }
    if (error_code == 403) {
      window.location.href = "/mainapp/error/403"
    }
    return Promise.reject(error)
  }
)

// Add a new method to send a message to the backend
http.sendMessage = async (companyId, query, sessionId) => {
  //return { results: { answer: "Answer repeated is " + query, } }

  const url = `${process.env.NEXT_PUBLIC_OPEN_API_FOR_CHAT}/assistant/ask`
  const params = {
    company_id: companyId,
    query: encodeURIComponent(query),
    session_id: sessionId,
  }
  const headers = {
    accept: "application/json",
    "X-API-KEY": process.env.NEXT_PUBLIC_OPEN_API_KEY_FOR_CHAT,
  }

  try {
    const response = await http.get(url, { params, headers })
    return response?.data
  } catch (error) {
    console.error(error)
    throw error
  }
}
http.pdfUpload = async (companyId, files) => {
  const url = `${process.env.NEXT_PUBLIC_OPEN_API_FOR_CHAT}/assistant/upload-pdfs`
  const formData = new FormData()

  for (const file of files) {
    formData.append("files", file)
  }

  const headers = {
    accept: "application/json",
    "X-API-KEY": process.env.NEXT_PUBLIC_OPEN_API_KEY_FOR_CHAT,
    "Content-Type": "multipart/form-data",
  }

  const params = {
    company_id: companyId,
  }

  try {
    const response = await http.post(url, formData, { headers, params })
    return response?.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const HTTPCHAT = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_OPEN_API_FOR_CHAT}`,
  headers: {
    ["X-API-KEY"]: process.env.NEXT_PUBLIC_OPEN_API_KEY_FOR_CHAT,
  },
})

http.getPdfList = async (
  companyId,
  page,
  search,
  sortColumn,
  sortOrder,
  limit
) => {
  const headers = {
    accept: "application/json",
    "X-API-KEY": process.env.NEXT_PUBLIC_OPEN_API_KEY_FOR_CHAT,
  }
  const params = {
    company_id: companyId || 0,
    page: page || 1,
    search: search || "",
    sortField: sortColumn || "",
    sortDirection: sortOrder || "",
    limit: limit || 10,
  }
  const url = `${process.env.NEXT_PUBLIC_OPEN_API_FOR_CHAT}/assistant/get-pdfs-list?company_id=${params.company_id}&page=${params.page}&search=${params.search}&sortField=${params.sortField}&sortDirection=${params.sortDirection}&limit=${params.limit}`
  console.log("url", url)
  try {
    const response = await http.get(url, { headers })
    return response?.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

// const response = await HTTPCHAT.get<{ sources: Source[]; totalPages: number }>(`/assistant/get-pdfs-list?company_id=${user_data?.organization}&page=${page}&search=${search}&sortField=${sortColumn}&sortDirection=${sortOrder}&limit=${limit}`);

http.sendFeedback = async (feedback_id, company_id, feedback) => {
  const url = `${process.env.NEXT_PUBLIC_OPEN_API_FOR_CHAT}/assistant/save-feedback?feedback_id=${feedback_id}&company_id=${company_id}&feedback=${feedback}`

  const headers = {
    accept: "application/json",
    "X-API-KEY": process.env.NEXT_PUBLIC_OPEN_API_KEY_FOR_CHAT,
  }

  try {
    const response = await http.post(url, null, { headers })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}
// process.env.NEXT_PUBLIC_OPEN_API_FOR_CHAT/assistant/delete-feedbacks?company_id=123&feedback_ids=stringASD&feedback_ids=stringASDASD&feedback_ids=string
http.deleteFeedback = async (company_id, feedback_ids) => {
  const url = `${process.env.NEXT_PUBLIC_OPEN_API_FOR_CHAT}/assistant/delete-feedbacks?company_id=${company_id}&feedback_ids=${feedback_ids.join("&feedback_ids=")}`
  console.log("deleting url is ", url)
  const headers = {
    accept: "application/json",
    "X-API-KEY": process.env.NEXT_PUBLIC_OPEN_API_KEY_FOR_CHAT,
  }

  try {
    const response = await http.delete(url, { headers })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}
http.deletePdf = async (company_id, file_names) => {
  const url = `${process.env.NEXT_PUBLIC_OPEN_API_FOR_CHAT}/assistant/delete-pdfs?company_id=${company_id}&file_names=${file_names.join("&file_names=")}`
  console.log("deleting url is ", url)
  return
  const headers = {
    accept: "application/json",
    "X-API-KEY": process.env.NEXT_PUBLIC_OPEN_API_KEY_FOR_CHAT,
  }

  try {
    const response = await http.delete(url, { headers })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export default http
