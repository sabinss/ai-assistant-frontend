import http from "@/config/http"
import useAuth from "@/store/user"
import React, { useEffect, useState } from "react"
import { FaEdit } from "react-icons/fa"
import { MdDelete } from "react-icons/md"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const sampleData = [
  {
    category: "",
    prompts: [],
  },
]

export const SampleQuerySetup = () => {
  const { user_data, access_token } = useAuth() // Call useAuth here
  const [organizationPrompts, setOrganizationPrompts] = useState([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null) // To track which prompt is being edited
  const [editedCategory, setEditedCategory] = useState<string>("")
  const [orgPromptId, setOrgPromptId] = useState<any>(null) // To track the edited category text
  const [deletePromptIds, setDeletePromptIds] = useState<any>([])

  useEffect(() => {
    async function fetchOrganizationQuery() {
      const res = await http.get("/organization/prompts", {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      setOrganizationPrompts(res.data?.organizationPrompts ?? sampleData)
    }
    fetchOrganizationQuery()
  }, [user_data])
  console.log("organizationPrompts", organizationPrompts)

  const saveOrgPrompt = async () => {
    try {
      console.log("organizationPrompts", organizationPrompts)
      const res = await http.post(
        "/organization/prompts",
        { organizationPrompts, deletePromptIds },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      )
      toast.success("Updated successfully")
      setDeletePromptIds([])

      console.log("res", res)
    } catch (err) {
      toast.error("Failed to update Prompts")
    }
  }

  const handleEditClick = (index: number, category: string) => {
    setEditingIndex(index)
    setEditedCategory(category)
  }
  const handleInputChange = (category: string, orgPromptId: any) => {
    setEditedCategory(category)
    setOrgPromptId(orgPromptId)
  }

  const handleCategoryNameSave = async (index: number, action = "save") => {
    try {
      if (action == "cancel") {
        setEditingIndex(null)
      }
      console.log("editCateogyr", editedCategory)
      console.log("orgPrmptId", orgPromptId)

      if (editedCategory && orgPromptId) {
        const res = await http.post(
          "/organization/prompts/category",
          { category: editedCategory, orgPromptId },
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )
        toast.success("Category updated successfully")
      }
    } catch (err) {
      toast.error("Failed to update")
    }
  }
  const handleDeletePrompt = (
    orgPromptId: number,
    promptId: number,
    index: number
  ) => {
    console.log("delete prompt id", promptId)
    const updatePrompts: any = organizationPrompts.map((orgPrompt: any) => {
      if (orgPromptId === orgPrompt._id) {
        console.log(orgPrompt._id, orgPromptId)
        return {
          ...orgPrompt,
          prompts: orgPrompt.prompts.filter((prompt: any, index: number) => {
            console.log("actiual id", prompt._id)
            if (prompt._id != promptId) {
              return prompt
            }
          }),
        }
      } else {
        return orgPrompt
      }
    })
    setOrganizationPrompts(updatePrompts)
    let deletePayload = { orgPromptId, promptId }
    setDeletePromptIds((prev: any) => [...prev, deletePayload])
  }
  console.log("deletePromptIds", deletePromptIds)
  const handleAddPrompt = (orgPromptId: number) => {
    const updatePrompts: any = organizationPrompts.map((orgPrompt: any) =>
      orgPrompt._id == orgPromptId
        ? {
            ...orgPrompt,
            prompts: [
              ...orgPrompt?.prompts,
              {
                text: "New Prompts",
                _id: `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Temporary unique ID
              },
            ],
          }
        : orgPrompt
    )
    setOrganizationPrompts(updatePrompts)
  }

  const handlePromptChange = (
    orgPromptId: number,
    promptId: number,
    promptIndex: number,
    newPrompt: any
  ) => {
    const updatePrompts: any = organizationPrompts.map((orgPrompt: any) => {
      if (orgPromptId === orgPrompt._id) {
        return {
          ...orgPrompt,
          isDirty: true,
          prompts: orgPrompt.prompts.map((prompt: any, index: number) => {
            if (prompt?._id === promptId) {
              return { ...prompt, text: newPrompt }
            } else {
              return prompt
            }
          }),
        }
      } else {
        return orgPrompt
      }
    })
    setOrganizationPrompts(updatePrompts)
  }
  return (
    <div className="mx-auto max-w-6xl  p-6">
      {organizationPrompts.length > 0 ? (
        <>
          {organizationPrompts.map((orgPrompts: any, index) => {
            return (
              <div className="mb-6 rounded-lg bg-white p-4 shadow" key={index}>
                {editingIndex == index ? (
                  <div className="flex w-full">
                    <input
                      type="text"
                      value={editedCategory}
                      onChange={(e) => {
                        handleInputChange(e.target.value, orgPrompts._id)
                      }}
                      className="w-full rounded border p-2"
                    />
                    <button
                      onClick={() => handleCategoryNameSave(index)}
                      className="ml-2 text-blue-500"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleCategoryNameSave(index, "cancel")}
                      className="ml-2 text-blue-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div>
                    <span className="text-xl font-bold">
                      {orgPrompts?.category}
                    </span>
                    <button
                      onClick={() =>
                        handleEditClick(index, orgPrompts.category)
                      }
                      className="ml-2"
                    >
                      <FaEdit />
                    </button>
                  </div>
                )}

                {/* OrganizationPrompts */}
                <div className="mb-4 mt-4">
                  <div className="flex items-center justify-between ">
                    <h3 className="text-xl font-semibold">Prompts</h3>
                    <button
                      onClick={() => handleAddPrompt(orgPrompts._id)}
                      className="mt-2 rounded-lg bg-blue-700 p-2 text-white focus:ring-4"
                    >
                      Add Prompt
                    </button>
                  </div>
                  <ul>
                    {orgPrompts?.prompts
                      ?.filter((x: any) => !x?.deleted)
                      .map((prompt: any, index: number) => {
                        return (
                          <li key={index} className="mt-3">
                            <div className="item-start flex justify-between">
                              <textarea
                                className="h-32 w-full rounded border border-gray-300 p-2"
                                value={prompt?.text}
                                onChange={(e) => {
                                  handlePromptChange(
                                    orgPrompts._id,
                                    prompt._id,
                                    index,
                                    e.target.value
                                  )
                                }}
                              />
                              <button
                                onClick={() =>
                                  handleDeletePrompt(
                                    orgPrompts._id,
                                    prompt._id,
                                    index
                                  )
                                }
                                className="mt-2 self-start text-red-500"
                              >
                                <MdDelete size={30} />
                              </button>
                            </div>
                          </li>
                        )
                      })}
                  </ul>
                  <button
                    onClick={() => saveOrgPrompt()}
                    className="mt-2 rounded-lg bg-blue-700 p-2 text-white focus:ring-4"
                  >
                    Save
                  </button>
                </div>
              </div>
            )
          })}
        </>
      ) : (
        <span className="tex flex justify-center font-bold">
          No prompts for organization
        </span>
      )}
    </div>
  )
}
