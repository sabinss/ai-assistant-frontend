import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FaRegTrashAlt } from "react-icons/fa"
import http from "@/config/http"
import useAuth from "@/store/user"

const DEFAULT_PROMPTS = [
  {
    name: "Insights & Recommendations",
    prompts: [],
  },
  {
    name: "Content Generation",
    prompts: [],
  },
  {
    name: "Data Entry",
    prompts: [],
  },
]

export default function PromptManager() {
  const [categories, setCategories] = useState<any>(DEFAULT_PROMPTS)
  const { access_token } = useAuth() // Call useAuth here

  useEffect(() => {
    fetchOrganizationPrompts()
  }, [])

  const fetchOrganizationPrompts = async () => {
    try {
      const res = await http.get("/organization/prompts", {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      console.log("Organization prompts", res.data.organizationPrompts)
      if (res.data.organizationPrompts.length > 0) {
        setCategories(res.data.organizationPrompts)
      }
    } catch (err) {
      console.log("Failed to fetch organization prompts", err)
    }
  }

  const updateCategoryName = (id, newName) => {
    setCategories(
      categories.map((cat) => (cat.id === id ? { ...cat, name: newName } : cat))
    )
  }

  const updatePrompt = (categoryId: any, index: number, text: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              prompts: cat.prompts.map((p, i) => (i === index ? text : p)),
            }
          : cat
      )
    )
  }

  const addPromptField = (id) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, text: [...cat.text, ""] } : cat
      )
    )
  }

  const deletePrompt = (categoryId, index) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? { ...cat, prompts: cat.prompts.filter((_, i) => i !== index) }
          : cat
      )
    )
  }

  const deleteCategory = (id) => {
    setCategories(categories.filter((cat) => cat.id !== id))
  }

  const capturePayload = () => {
    console.log("Final Payload:", categories)
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      {categories.map((category: any) => (
        <div
          key={category._id}
          className="mb-6 rounded-lg border bg-white p-4 shadow-md"
        >
          <div className="mb-2 flex items-center justify-between">
            <Input
              value={category.name}
              onChange={(e) => updateCategoryName(category.id, e.target.value)}
              className="border-none text-lg font-semibold focus:ring-0"
            />
          </div>
          <div>
            {category.prompts.map(({ text }: any, index: number) => (
              <div key={index} className="my-2 flex items-center space-x-2">
                <Textarea
                  value={text}
                  onChange={(e) =>
                    updatePrompt(category._id, index, e.target.value)
                  }
                  className="h-32 w-full rounded-lg border p-2"
                />
                <Button
                  onClick={() => deletePrompt(category._id, index)}
                  className="bg-red-600 py-2 text-white"
                >
                  <FaRegTrashAlt />
                </Button>
              </div>
            ))}
          </div>
          <Button
            onClick={() => addPromptField(category._id)}
            className="mt-5 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:from-blue-800 hover:to-blue-600"
          >
            Add More
          </Button>
        </div>
      ))}
      <Button
        onClick={capturePayload}
        className="mt-4 w-full bg-blue-600 py-2 text-white"
      >
        Save
      </Button>
    </div>
  )
}
