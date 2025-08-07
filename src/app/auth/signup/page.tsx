"use client"
import { Button } from "@/components/ui/button"
import http from "@/config/http"
import Link from "next/link"
import React, { useState } from "react"
import { useForm, SubmitHandler, FieldValues } from "react-hook-form"
import {
  Mail,
  UserRound,
  Landmark,
  BookA,
  UnlockKeyhole,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Checkbox } from "@/components/ui/checkbox"

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()
  const [error, setError] = useState("")
  const [enteredDetails, setEnteredDetails] = useState(false)
  const [togglePass, setTogglePass] = useState("password")
  const [formData, setFormData] = useState("")
  const [privacyPolicyChecked, setPrivacyPolicyChecked] = useState(false)
  const [termsOfUseChecked, setTermsOfUseChecked] = useState(false)

  const togglePassword = () => {
    setTogglePass((prev) => (prev === "password" ? "text" : "password"))
  }

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    await sendConfirmEmail(data.email)
    setFormData(data)
    setEnteredDetails(true)
  }

  // Check if both checkboxes are checked
  const isFormValid = privacyPolicyChecked && termsOfUseChecked

  return (
    <div className="px-4">
      <h1 className="mt-2 text-center text-2xl font-semibold">Signup</h1>
      {error && (
        <div className="mt-2 flex flex-col rounded-lg bg-red-300 px-8 py-1 font-normal text-red-700">
          {error}
        </div>
      )}
      {!enteredDetails ? (
        <form
          className="mt-4 flex flex-col gap-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div
            className={`flex rounded-lg border-2 ${errors?.email ? "border-red-700" : "border-[#CCC]"} bg-[#E7E7E7] px-3 py-2`}
          >
            <input
              className="w-full bg-transparent text-sm text-slate-600 outline-none"
              type="email"
              aria-invalid={errors.email ? "true" : "false"}
              placeholder="Email Address"
              {...register("email", { required: true })}
            />
            <div className="border-l-2 border-[#CCC] pl-2">
              <Mail
                className={`${errors?.email ? "text-red-700" : "text-[#CCC]"}`}
              />
            </div>
          </div>
          {errors?.email &&
            (errors?.email?.type === "required" ||
              errors?.email?.type === "pattern") && (
              <span
                role="alert"
                className="mt-[-10px] text-[12px] text-red-700"
              >
                {errors?.email?.type === "pattern"
                  ? "Entered value does not match email format"
                  : "Email field is required"}
              </span>
            )}
          <div
            className={`flex rounded-lg border-2 ${errors?.first_name ? "border-red-700" : "border-[#CCC]"} bg-[#E7E7E7] px-3 py-2`}
          >
            <input
              className="w-full bg-transparent text-sm text-slate-600 outline-none"
              type="text"
              placeholder="First Name"
              {...register("first_name", { required: true })}
            />
            <div className="border-l-2 border-[#CCC] pl-2">
              <UserRound
                className={`${errors?.first_name ? "text-red-700" : "text-[#CCC]"}`}
              />
            </div>
          </div>
          {errors?.first_name && errors?.first_name?.type === "required" && (
            <span role="alert" className="mt-[-10px] text-[12px] text-red-700">
              First Name field is required
            </span>
          )}
          <div
            className={`flex rounded-lg border-2 ${errors?.last_name ? "border-red-700" : "border-[#CCC]"} bg-[#E7E7E7] px-3 py-2`}
          >
            <input
              className="w-full bg-transparent text-sm text-slate-600 outline-none"
              type="text"
              placeholder="Last Name"
              {...register("last_name", { required: true })}
            />
            <div className="border-l-2 border-[#CCC] pl-2">
              <UserRound
                className={`${errors?.last_name ? "text-red-700" : "text-[#CCC]"}`}
              />
            </div>
          </div>
          {errors?.last_name && errors?.last_name?.type === "required" && (
            <span role="alert" className="mt-[-10px] text-[12px] text-red-700">
              Last Name field is required
            </span>
          )}
          <div
            className={`flex rounded-lg border-2 ${errors?.organization_name ? "border-red-700" : "border-[#CCC]"} bg-[#E7E7E7] px-3 py-2`}
          >
            <input
              className="w-full bg-transparent text-sm text-slate-600 outline-none"
              type="text"
              placeholder="Organization Name"
              {...register("organization_name", { required: true })}
            />
            <div className="border-l-2 border-[#CCC] pl-2">
              <Landmark
                className={`${errors?.organization_name ? "text-red-700" : "text-[#CCC]"}`}
              />
            </div>
          </div>
          {errors?.organization_name &&
            errors?.organization_name?.type === "required" && (
              <span
                role="alert"
                className="mt-[-10px] text-[12px] text-red-700"
              >
                Organization Name field is required
              </span>
            )}
          <div
            className={`flex rounded-lg border-2 ${errors?.ai_assistant_name ? "border-red-700" : "border-[#CCC]"} bg-[#E7E7E7] px-3 py-2`}
          >
            <input
              className="w-full bg-transparent text-sm text-slate-600 outline-none"
              type="text"
              placeholder="AI Assistant Name"
              {...register("ai_assistant_name", { required: true })}
            />
            <div className="border-l-2 border-[#CCC] pl-2">
              <BookA
                className={`${errors?.ai_assistant_name ? "text-red-700" : "text-[#CCC]"}`}
              />
            </div>
          </div>
          {errors?.ai_assistant_name &&
            errors?.ai_assistant_name?.type === "required" && (
              <span
                role="alert"
                className="mt-[-10px] text-[12px] text-red-700"
              >
                AI Assistant field is required
              </span>
            )}
          <div
            className={`flex rounded-lg border-2 ${errors?.password ? "border-red-700" : "border-[#CCC]"} bg-[#E7E7E7] px-3 py-2`}
          >
            <input
              className="w-full bg-transparent text-sm text-slate-600 outline-none"
              type={togglePass}
              placeholder="Password"
              {...register("password", { required: true })}
            />
            <div className="border-l-2 border-[#CCC] pl-2">
              {togglePass === "password" ? (
                <EyeIcon
                  onClick={togglePassword}
                  className={
                    errors?.password ? "text-red-700" : "text-[#a2a2a2]"
                  }
                />
              ) : (
                <EyeOffIcon
                  onClick={togglePassword}
                  className="cursor-pointer text-[#a3a3a3]"
                />
              )}
            </div>
          </div>
          {errors?.password && errors?.password?.type === "required" && (
            <span role="alert" className="mt-[-10px] text-[12px] text-red-700">
              Password field is required
            </span>
          )}

          {/* Privacy Policy and Terms of Use Checkboxes - Horizontal Layout */}
          {/* <div className="mt-2 flex items-center justify-between text-xs">
            <div className="flex items-center">
              <Checkbox
                checked={privacyPolicyChecked}
                onCheckedChange={(checked) =>
                  setPrivacyPolicyChecked(checked as boolean)
                }
              />
              <span className="ml-2">
                I agree with{" "}
                <Link href="/privacy" className="text-blue-500 hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <div className="flex items-center">
              <Checkbox
                checked={termsOfUseChecked}
                onCheckedChange={(checked) =>
                  setTermsOfUseChecked(checked as boolean)
                }
              />
              <span className="ml-2">
                I agree with{" "}
                <Link href="/terms" className="text-blue-500 hover:underline">
                  Terms of Use
                </Link>
              </span>
            </div>
          </div> */}
          <div className="mt-5 rounded-lg bg-gray-100 p-2 text-xs">
            <span>
              By creating an account, you confirm that you have read and agree
              to our
            </span>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center">
                <Checkbox
                  checked={termsOfUseChecked}
                  onCheckedChange={(checked) =>
                    setTermsOfUseChecked(checked as boolean)
                  }
                />
                <span className="ml-2">
                  <Link
                    href="/master_agreement"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Master Subscription Agreement
                  </Link>
                </span>
              </div>
              <div className="flex items-center">
                <Checkbox
                  checked={privacyPolicyChecked}
                  onCheckedChange={(checked) =>
                    setPrivacyPolicyChecked(checked as boolean)
                  }
                />
                <span className="ml-2">
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </div>
            </div>
          </div>

          {isSubmitting ? (
            <Button
              type="submit"
              className="disabled bg-[#174894] hover:bg-[#173094]"
              disabled={!isFormValid}
            >
              <svg
                aria-hidden="true"
                role="status"
                className="me-3 inline h-4 w-4 animate-spin text-white"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
            </Button>
          ) : (
            <Button
              type="submit"
              className={`${isFormValid ? "bg-[#174894] hover:bg-[#173094]" : "cursor-not-allowed bg-gray-400"}`}
              disabled={!isFormValid}
            >
              Sign Up
            </Button>
          )}
        </form>
      ) : (
        <EmailConfirmDialog formData={formData} />
      )}
      <div className="relative mx-auto mt-3 h-[1px] w-[80%] bg-slate-200">
        <div className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white px-2">
          or
        </div>
      </div>
      <div>
        <p className="mt-3 text-center text-xs">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

const EmailConfirmDialog = ({ formData }) => {
  const router = useRouter()
  const [verificationCode, setVerificationCode] = useState("")
  const [isValidCode, setIsValidCode] = useState(false)

  const handleCodeChange = (e) => {
    setVerificationCode(e?.target?.value)
  }

  const handleVerify = async () => {
    const isValid = await isValidToken(formData?.email, verificationCode)
    if (isValid) {
      setIsValidCode(true)
      handleSubmit()
    } else {
      toast.error("Invalid verification code")
    }
  }

  const handleSubmit = async () => {
    try {
      let res = await http.post("/auth/signup", formData)
      if (res.status === 201) {
        toast.success("Account Created Successfully now login ")
        router.push("/auth/signin")
      } else {
        toast.error(res?.data?.message)
      }
    } catch (error) {
      toast.error("Something went Wrong from Backend")
      console.log("Error Occured ", error)
    }
  }

  return (
    <div className="mt-4 flex flex-col items-center">
      <h1 className="mt-2 text-center text-2xl font-semibold">
        Email Confirmation
      </h1>
      <input
        className="mt-2 rounded border p-2"
        type="text"
        placeholder="Enter verification code"
        value={verificationCode}
        onChange={handleCodeChange}
      />
      <Button
        onClick={() => handleVerify()}
        className="mt-2 bg-[#174894] hover:bg-[#173094]"
      >
        Verify
      </Button>
      {isValidCode && (
        <div className="mt-4">
          <p className="text-green-600">
            Code verified successfully! Creating your account
          </p>
        </div>
      )}
    </div>
  )
}

const sendConfirmEmail = async (email) => {
  try {
    await http.post("/auth/sendEmailVerifyToken", { email })
    toast.success("Verification email sent")
  } catch (e) {
    toast.error(e?.response?.data?.message)
  }
}

const isValidToken = async (email, token) => {
  try {
    const response = await http.post("/auth/email-verify", { email, token })
    if (response.status === 200) {
      toast.success(response?.data?.message)
      return true
    } else if (response.status === 201) {
      toast.error(response?.data?.message)
      return false
    }
  } catch (e) {
    console.log(e)
    return false
  }
}
