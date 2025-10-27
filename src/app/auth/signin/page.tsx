"use client"
import Link from "next/link"
import React, { useState } from "react"
import http from "@/config/http"
import useAuth from "@/store/user"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, EyeIcon, EyeOffIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm, SubmitHandler, FieldValues } from "react-hook-form"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { trackLogin } from "@/utility/tracking"
import { initializeOrganization } from "@/utility/organizationSetup"
import useOrgCustomer from "@/store/organization_customer"
export default function page() {
  const [error, setError] = useState("")
  const [togglePass, setTogglePass] = useState("password")
  const [privacyPolicyChecked, setPrivacyPolicyChecked] = useState(false)
  const [termsOfUseChecked, setTermsOfUseChecked] = useState(false)
  const [showEmailVerifyDialog, setShowEmailVerifyDialog] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()
  const { register, handleSubmit, formState } = useForm()
  const { errors, isSubmitting } = formState
  const { loginUser } = useAuth()
  const { setOrgToken } = useOrgCustomer()
  const [showPrivacy, setShowPrivacy] = useState(false)

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      let res = await http.post("/auth/signin", data)
      if (res.status === 201) {
        setError(res?.data?.message)
      }
      if (res.status === 200) {
        // Check if user is verified
        if (res.data?.isVerified === false) {
          setUserEmail(data.email)
          setShowEmailVerifyDialog(true)
          await sendConfirmEmail(data.email)
          return
        }

        loginUser(
          res.data?.user_details,
          res.data?.access_token,
          res.data?.rolePermission,
          res.data?.chatSession
        )
        const { email, organization, user_id, ...rest } = res.data.user_details

        // Track login event
        trackLogin(email, organization)

        // Initialize organization setup after successful login
        try {
          await initializeOrganization(res.data?.access_token, setOrgToken)
          console.log("Organization setup completed successfully")
        } catch (orgError) {
          console.error("Organization setup failed:", orgError)
          // Don't block the login flow if organization setup fails
        }

        router.push("/mainapp/chat")
        toast.success("Logged in successfully", { autoClose: 100 })
      }
    } catch (error: any) {
      console.log("Error Occured ", error)
      if (error.response?.status === 401) {
        toast.error(
          error.response?.data?.message || "Unauthorized! Invalid credentials."
        )
      } else {
        toast.error("Something went wrong. Please try again.")
      }
    }
  }

  const TogglePassword = (param: string) => {
    const params = param === "password" ? "text" : "password"
    setTogglePass(params)
  }

  if (showEmailVerifyDialog) {
    return (
      <EmailVerifyDialog
        userEmail={userEmail}
        setShowEmailVerifyDialog={setShowEmailVerifyDialog}
      />
    )
  }

  return (
    <div className="px-8">
      <h1 className="text-center text-2xl font-semibold ">Login</h1>
      {error && (
        <div className="mt-5 flex flex-col rounded-lg bg-red-300 px-8 py-2 font-normal text-red-700">
          {error}
        </div>
      )}
      <form
        className="mt-5 flex flex-col gap-3"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div
          className={`flex rounded-lg  border-2 ${errors?.email ? "border-red-700" : "border-[#CCC]"} bg-[#E7E7E7] px-3 py-2`}
        >
          <input
            className={`w-full bg-transparent text-sm ${errors?.email ? "border-red-700" : "text-slate-600"} outline-none`}
            type="email"
            aria-invalid={errors.email ? "true" : "false"}
            placeholder="Email Address"
            {...register("email", { required: true })}
          />
          <div
            className={`border-l-2 ${errors?.email ? "border-red-700" : "border-[#CCC]"} pl-2`}
          >
            <Mail
              className={`${errors?.email ? "text-red-700" : "text-[#9e9c9c]"}`}
            />
          </div>
        </div>
        {errors?.email && errors?.email?.type === "required" && (
          <span role="alert" className="mt-[-10px] text-[12px] text-red-700">
            This field is required
          </span>
        )}

        <div
          className={`flex rounded-lg border-2 ${errors?.password ? "border-red-700" : "border-[#CCC]"} bg-[#E7E7E7] px-3 py-2`}
        >
          <input
            className="w-full bg-transparent text-sm text-slate-600 outline-none after:bg-none"
            type={togglePass}
            aria-invalid={errors?.password ? "true" : "false"}
            placeholder="Password"
            {...register("password", { required: true })}
          />
          <div
            className={`border-l-2 ${errors?.password ? "border-red-700" : "border-[#CCC]"} pl-2`}
          >
            {togglePass !== "password" ? (
              <EyeOffIcon
                onClick={() => TogglePassword("text")}
                className={`${errors?.password ? "text-red-700" : "text-[#9e9c9c]"} cursor-pointer`}
              />
            ) : (
              <EyeIcon
                onClick={() => TogglePassword("password")}
                className={`${errors?.password ? "text-red-700" : "text-[#9e9c9c]"} cursor-pointer`}
              />
            )}
          </div>
        </div>
        {errors?.password && errors?.password?.type === "required" && (
          <span role="alert" className="mt-[-10px] text-[12px] text-red-700">
            This field is required
          </span>
        )}

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center">
            <Checkbox /> <span className="ml-2">Remember me</span>
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-blue-500 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {isSubmitting && (
          <Button
            type="submit"
            className="disabled bg-[#174894] hover:bg-[#173094]"
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
        )}
        {!isSubmitting && (
          <Button type="submit" className="bg-[#174894] hover:bg-[#173094]">
            Login
          </Button>
        )}
      </form>

      <div className="mt-5 rounded-lg bg-gray-100 p-2 text-xs">
        <span>
          By continuing you are indicating that you have read and agree to the{" "}
          <span className="font-bold text-blue-900 hover:underline">
            <Link
              href="/master_agreement"
              target="_blank"
              rel="noopener noreferrer"
            >
              <b>Terms of Use</b>
            </Link>
          </span>
          <span> and </span>
          <span className="font-bold text-blue-900 hover:underline">
            <Link href="/privacy" target="_blank" rel="noopener noreferrer">
              <b>Privacy Policy</b>
            </Link>
          </span>
        </span>
      </div>

      {/* Privacy Policy and Terms of Use Checkboxes - Horizontal Layout at Bottom */}
      {/* <div className="mt-3 flex items-center justify-between text-xs">
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

      {/* <div className="mt-3 flex justify-between text-xs">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/auth/forgot-password">Forgot Password?</Link>
      </div> */}

      {/* <div className="mt-3">
   
      <p className="mt-3 text-center text-xs">
        Don't have an account?{" "}
        <Link href="/auth/signup" className="text-blue-500">
          Sign up
        </Link>
      </p>
    </div> */}
    </div>
  )
}

const EmailVerifyDialog = ({
  userEmail,
  setShowEmailVerifyDialog,
}: {
  userEmail: string
  setShowEmailVerifyDialog: (show: boolean) => void
}) => {
  const [verificationCode, setVerificationCode] = useState("")
  const [isValidCode, setIsValidCode] = useState(false)

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e?.target?.value)
  }

  const handleVerify = async () => {
    const isValid = await isValidToken(userEmail, verificationCode)
    if (isValid) {
      setIsValidCode(true)
      toast.success("Email verified! Please login again")
      // Hide the email dialog and show the login page
      setTimeout(() => {
        setShowEmailVerifyDialog(false)
      }, 1000)
    } else {
      toast.error("Invalid verification code")
    }
  }

  return (
    <div className="px-8">
      <div className="mt-4 flex flex-col items-center">
        <h1 className="mt-2 text-center text-2xl font-semibold">
          Email Confirmation Required
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please verify your email to continue. A verification code has been
          sent to {userEmail}
        </p>
        <input
          className="mt-4 rounded-lg border-2 border-[#CCC] bg-[#E7E7E7] px-3 py-2 text-sm outline-none"
          type="text"
          placeholder="Enter verification code"
          value={verificationCode}
          onChange={handleCodeChange}
        />
        <Button
          onClick={handleVerify}
          className="mt-4 bg-[#174894] hover:bg-[#173094]"
        >
          Verify
        </Button>
        {isValidCode && (
          <div className="mt-4">
            <p className="text-green-600">Code verified successfully!</p>
          </div>
        )}
        <Button
          onClick={() => setShowEmailVerifyDialog(false)}
          variant="outline"
          className="mt-2"
        >
          Back to Login
        </Button>
      </div>
    </div>
  )
}

const sendConfirmEmail = async (email: string) => {
  try {
    await http.post("/auth/sendEmailVerifyToken", { email })
    toast.success("Verification email sent")
  } catch (e: any) {
    toast.error(e?.response?.data?.message)
  }
}

const isValidToken = async (email: string, token: string) => {
  try {
    const response = await http.post("/auth/email-verify", { email, token })
    if (response.status === 200) {
      toast.success(response?.data?.message)
      return true
    } else if (response.status === 201) {
      toast.error(response?.data?.message)
      return false
    }
  } catch (e: any) {
    console.log(e)
    return false
  }
}
