"use client"
import { useState, useCallback } from "react"
import { Files, Sheet } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { FaGlobe, FaGoogleDrive, FaQuestionCircle } from "react-icons/fa"
import http from "@/config/http"
import { useRouter } from "next/navigation"
import useAuth from "@/store/user"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function page() {
  const { user_data, access_token } = useAuth() // Call useAuth here
  console.log("user_data", user_data)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<String>("files")

  const data = [
    {
      name: "Files",
      key: "files",
      description: "Upload a file or Drag a file.(PDF, PPT, DOC upto 10MB).",
      icon: (
        <Files
          className={`${activeTab === "files" ? "text-white" : "text-[#A7A7A7]"} mx-2`}
          size={40}
        />
      ),
    },
    // {
    //     name: 'Table',
    //     key: 'table',
    //     description: 'Upload CSV, XLSX and XLS file containing structured text data.',
    //     icon: <Sheet className={`${activeTab === 'table' ? 'text-white' : 'text-[#A7A7A7]'} mx-2`} size={40} />,
    // },
    // {
    //     name: 'Google Drive',
    //     key: 'google-drive',
    //     description: 'Upload CSV, XLSX and XLS file containing structured text data.',
    //     icon: <FaGoogleDrive className={`${activeTab === 'google-drive' ? 'text-white' : 'text-[#A7A7A7]'} mx-2`} size={40} />,
    // },
    // {
    //     name: 'Website',
    //     key: 'website',
    //     description: 'Add URL to be  scrapped and indexed from training.',
    //     icon: <FaGlobe className={`${activeTab === 'website' ? 'text-white' : 'text-[#A7A7A7]'} mx-2`} size={40} />,
    // }
  ]

  const handleFileTabs = (tab) => {
    setActiveTab(tab)
  }

  let isUploadInProgress = false

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log("file reading was aborted")
      reader.onerror = () => console.log("file reading has failed")
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result
        handlePdfUpload([file])
      }
      reader.readAsArrayBuffer(file)
    })
  }, [])
  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  const handlePdfUpload = async (files) => {
    setIsLoading(true)
    const pdfFiles = files.filter((file) => file.type === "application/pdf")
    if (pdfFiles.length > 0) {
      try {
        const formData = new FormData()
        // Append multiple files with the same key 'files[]'
        pdfFiles.forEach((file) => {
          formData.append("files", file)
        })
        const company_id = user_data?.organization

        console.log("pdfFiles", pdfFiles)
        const res = await http.post(
          `/organization/source/upload-pdf?company_id=${company_id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )
        // await http.pdfUpload(user_data?.organization, pdfFiles)
        // setIsLoading(false)
        // router.push("/mainapp/source")
      } catch (error: any) {
        console.error("source upload error", error)
        setIsLoading(false)
        toast.error(error?.response?.data?.error ?? "Failed to upload file")
      } finally {
        setIsLoading(false)
        router.push("/mainapp/source")
      }
    }
  }

  const dropzoneStyle = {
    border: "2px dashed #cccccc",
    borderRadius: "4px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    marginBottom: "20px",
  }

  const loaderStyle = {
    fontSize: "18px",
    fontWeight: "bold",
  }
  return (
    <div className="w-full rounded-md bg-white p-3 text-sm text-[#333333]">
      <p className="inline text-xl font-semibold">Data Sources</p>
      <FaQuestionCircle className="ml-2 inline rounded-full bg-white text-[#1E5DC0]" />
      <div className="box my-4 w-full rounded-md border-[#CCCCCC] bg-[#E7E7E7] px-4 py-2">
        File Data Source
      </div>
      <p className=" pl-3">Upload documents (PDF upto 10MB).</p>
      <div className="mt-3 flex flex-col-reverse gap-2 md:flex-row">
        {/* <div className="cards flex w-full flex-col gap-6 md:w-2/5 md:p-6 ">
          {data?.map((item) => {
            return (
              <div
                key={item?.key}
                onClick={() => handleFileTabs(item?.key)}
                className={`file cursor-pointer rounded-lg border-b border-[#D7D7D7] p-4 hover:bg-muted ${activeTab === item?.key ? "bg-[#174894] text-white" : ""}`}
              >
                <p>{item?.name}</p>
                <div className="flex py-6">
                  {item?.icon}
                  <p className={`${activeTab === item?.key ? "text-white" : "text-[#535353]"}`}>
                    {item?.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div> */}
        <div className="uploadscreen w-full cursor-pointer md:w-3/5 md:p-6 ">
          <div className="flex h-full w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-black bg-[#E7E7E7]">
            <div className="p-3 font-semibold">
              <div {...getRootProps({ className: "dropzone" })} style={dropzoneStyle}>
                <input {...getInputProps()} />
                {isLoading ? (
                  <div style={loaderStyle}>Loading...</div>
                ) : (
                  <p>Drag 'n' drop some files here, or click to select files</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
