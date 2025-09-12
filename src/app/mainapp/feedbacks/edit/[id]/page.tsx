"use client"
import { BiDislike, BiLike, BiSolidLike, BiSolidDislike } from "react-icons/bi"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import http from "@/config/http"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useRouter } from "next/navigation"
import { DrawerClose } from "@/components/ui/drawer"
import useAuth from "@/store/user"
import useFormStore from "@/store/formdata"

const EditFeedback = ({ params, type }) => {
  const { access_token } = useAuth() // Call useAuth here
  const [feedbackState, setFeedbackState] = useState<string | null>(null)
  const feedback_id = params.id
  const [modifiedAnswer, setModifiedAnswer] = useState("")
  const [question, setQuestion] = useState("")
  const [originalAnswer, setOriginalAnswer] = useState("")
  const router = useRouter()
  const { updateFeedbackTable } = useFormStore()

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await http.get(`/feedback/${feedback_id}`, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        const feedback = response?.data?.feedback
        setFeedbackState(feedback.feedback)
        setModifiedAnswer(
          feedback.modified_answer || feedback.conversation.answer
        )
        setQuestion(feedback.conversation.question)
        setOriginalAnswer(feedback.conversation.answer)
      } catch (error) {
        console.error("Failed to fetch data", error)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    if (type === "drawer") {
      console.log(" close drawer")
      // e.preventDefault();
    }
    try {
      const response = await http.put(
        `/feedback/${feedback_id}`,
        {
          modified_answer: modifiedAnswer,
          // feedback: feedbackState,
        },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      )
      toast.success("Feedback updated successfully")
      updateFeedbackTable("removeState", Math.random())

      router.push("/mainapp/feedbacks")
    } catch (error) {
      console.error("Failed to submit data", error)
      toast.error("Failed to submit data" + error)
    }
  }

  return (
    <div className="w-full rounded-md bg-white p-4">
      <h1 className="mb-10 text-2xl">Edit Feedback</h1>
      <div className="flex flex-col gap-4">
        <div className="flex">
          <p className="w-1/5">Question:</p>
          <p>{question}</p>
        </div>
        <div className="flex">
          <label htmlFor="" className="w-1/5">
            Original Answer:
          </label>
          <textarea
            disabled
            className="w-4/5 rounded-md border border-[#CCCCCC] bg-[#e7e7e7] px-4 py-2"
            rows={5}
            value={originalAnswer}
          />
        </div>
        <div className="flex">
          <label htmlFor="" className="w-1/5">
            New Answer:
          </label>
          <textarea
            name=""
            onChange={(e) => setModifiedAnswer(e.target.value)}
            rows={5}
            className="w-4/5 rounded-md border border-[#CCCCCC] bg-inherit px-4 py-2"
            value={modifiedAnswer}
          />
        </div>
        <div className="likedislike flex gap-4">
          Feedback:
          {feedbackState === "liked" ? (
            <div className="flex gap-4">
              <BiSolidLike aria-disabled size={30} className="text-red-500" />
              <BiDislike size={30} className="text-red-500" />
            </div>
          ) : (
            <div className="flex gap-4">
              <BiLike size={30} aria-disabled className="text-red-500 " />
              <BiSolidDislike size={30} className="text-red-500" />
            </div>
          )}
        </div>
        <div className="buttons flex justify-end gap-2">
          {type === "drawer" ? (
            <>
              <DrawerClose>
                <Button
                  type="submit"
                  className="bg-[#174894] font-medium hover:bg-[#173094]"
                  onClick={handleSubmit}
                >
                  Submit
                </Button>
              </DrawerClose>
              <DrawerClose>
                <Button className="rounded-md border border-[#CDCDCD] bg-gradient-to-b from-white to-[#CDCDCD] font-medium text-[#535353]">
                  Cancel
                </Button>
              </DrawerClose>
            </>
          ) : (
            <>
              <Button
                type="submit"
                className="bg-[#174894] font-medium hover:bg-[#173094]"
                onClick={handleSubmit}
              >
                Submit
              </Button>
              <Link href={"/mainapp/feedbacks"}>
                <Button className="rounded-md border border-[#CDCDCD] bg-gradient-to-b from-white to-[#CDCDCD] font-medium text-[#535353]">
                  Cancel
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditFeedback
