"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import http from "@/config/http"
import { FaRegUser, FaEye, FaEyeSlash } from "react-icons/fa"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import useAuth from "@/store/user"
import { getGoogleOAuthURL } from "@/utility/getGoogleUrl"
import GmailLoginButton from "@/components/ui/googleLoginButton"

interface FormData {
  first_name: string
  last_name: string
  email: string
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
  status: string
}

export default function EditProfile({ params }: { params: { id: string } }) {
  const { user_data, access_token } = useAuth() // Call useAuth here
  const [showChange, setShowChange] = useState(false)
  const user_id = params.id
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [status, setStatus] = useState<{ id: string; name: string }[]>([])
  const [isGoogleLogin, setGoogleLogin] = useState(false)
  const [checkingGoogleUser, setCheckingGoogleUser] = useState(false)
  const [googleLoggedInUser, setGoogleLoginUser] = useState<null>(null)

  useEffect(() => {
    checkGoogleLoggedInUser()
  }, [])

  const disconnectGoogleUser = async () => {
    try {
      if (user_data?.email) {
        const res = await http.post(
          "/auth/google-login/disconnect",
          { email: user_data.email },
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )
        console.log("disconnect", res)
        if (res?.data?.success) {
          setGoogleLoginUser(null)
          setGoogleLogin(false)
        }
      }
    } catch (err) {
      toast.error("Something went wrong")
    }
  }

  const checkGoogleLoggedInUser = async () => {
    try {
      setCheckingGoogleUser(true)
      if (user_data?.email) {
        const res = await http.post(
          "/auth/google-login-verify",
          { email: user_data.email },
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )
        console.log("res", res.data)
        if (res?.data?.success) {
          setGoogleLoginUser(res.data.data.email)
          setGoogleLogin(true)
        }
        setCheckingGoogleUser(false)
      }
    } catch (err) {
      console.log(err)
      setCheckingGoogleUser(false)
    }
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<FormData>()

  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        const [userData, statusData] = await Promise.all([
          http.get(`/user/profile`, {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }),
          http.get("/status", {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }),
        ])
        const { first_name, last_name, email, status } = userData?.data?.user
        setValue("first_name", first_name)
        setValue("last_name", last_name)
        setValue("email", email)
        setValue("status", status?.name)
        setStatus(
          statusData?.data.map((item: any) => ({
            id: item._id,
            name: item.name,
          }))
        )
      } catch (error) {
        console.error("Failed to fetch data", error)
        toast.error("Failed to load data.")
      }
    }

    fetchData()
  }, [])

  const handlePasswordToggle = () => {
    setShowChange(!showChange)
    setValue("newPassword", "")
    setValue("confirmNewPassword", "")
    setValue("currentPassword", "")
  }

  const onSubmit = async (data: FormData) => {
    const selectedStatus = status?.find((item) => item?.name === data?.status)
    const updatedData = { ...data, status: selectedStatus?.id }
    try {
      await http.patch(`/user/profile/update`, updatedData, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      toast.success("Profile updated successfully!")
      router.push("/mainapp/users")
    } catch (error) {
      console.error("Failed to update profile", error)
      toast.error("Failed to update profile. Please try again.")
    }
  }

  return (
    <div className="w-full rounded-md bg-white p-4 text-[#333333]">
      <p className="mb-6 text-2xl">Edit Profile</p>
      {/* User Details */}
      <div className="userDetails flex flex-col gap-4 text-base">
        {/* Email */}
        <div className="flex flex-col items-center md:flex-row">
          <p className="mb-2 w-full font-semibold md:mb-0 md:w-1/3">Email:</p>
          <input
            type="text"
            disabled
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
            placeholder="john@example.com"
            className="w-full cursor-not-allowed rounded-md border border-[#CCCCCC] px-4 py-2 text-[#737373]"
          />
          {errors.email && (
            <span className="text-red-500">{errors.email.message}</span>
          )}
        </div>
        {/* First Name */}
        <div className="flex flex-col items-center md:flex-row">
          <p className="mb-2 w-full font-semibold md:mb-0 md:w-1/3">
            First Name:
          </p>
          <input
            type="text"
            {...register("first_name", { required: "First name is required" })}
            placeholder="John"
            className="w-full rounded-md border border-[#CCCCCC] px-4 py-2 text-[#737373]"
          />
          {errors.first_name && (
            <span className="text-red-500">{errors.first_name.message}</span>
          )}
        </div>

        {/* Last Name */}
        <div className="flex flex-col items-center md:flex-row">
          <p className="mb-2 w-full font-semibold md:mb-0 md:w-1/3">
            Last Name:
          </p>
          <input
            type="text"
            {...register("last_name", { required: "Last name is required" })}
            placeholder="Doe"
            className="w-full rounded-md border border-[#CCCCCC] px-4 py-2 text-[#737373]"
          />
          {errors.last_name && (
            <span className="text-red-500">{errors.last_name.message}</span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-col items-center md:flex-row">
        <p className="mb-2 w-full font-semibold md:mb-0 md:w-1/3">Status:</p>
        <select
          {...register("status")}
          disabled={user_data?.user_id === user_id}
          value={watch("status")}
          className="w-full rounded-md border border-[#CCCCCC] px-4 py-2 text-[#737373] disabled:cursor-not-allowed"
        >
          {status?.map((item) => (
            <option key={item?.id} value={item?.name}>
              {item?.name}
            </option>
          ))}
        </select>
      </div>

      {/* Change Password */}
      <div className="changePassword mt-2">
        <p className="mb-6 text-xl">
          Change Password{" "}
          <Switch
            className="ml-2 text-sm"
            id="showpwchange"
            onCheckedChange={handlePasswordToggle}
          />
        </p>
        {showChange && (
          <div className="form flex flex-col gap-4">
            {/* New Password */}
            <div className="mt-4 flex flex-col items-center md:flex-row">
              <p className="mb-2 text-[14px] text-red-500 md:mb-0">
                Your password must be 8 character long, combined with uppercase,
                numbers and symbols.
              </p>
            </div>
            <div className="flex flex-col items-center md:flex-row">
              <p className="mb-2 w-full font-semibold md:mb-0 md:w-1/3">
                Current Password:
              </p>
              <div className="relative w-full md:w-2/3">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  {...register("currentPassword", {
                    required: "Current password field is required!",
                  })}
                  placeholder="Enter Current password"
                  className="w-full rounded-md border border-[#CCCCCC] px-4 py-2 text-[#737373]"
                />
                {errors?.currentPassword && (
                  <span className="text-red-500">
                    {errors?.currentPassword?.message}
                  </span>
                )}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-base leading-5">
                  {!showCurrentPassword ? (
                    <FaEyeSlash
                      size={20}
                      className="cursor-pointer"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    />
                  ) : (
                    <FaEye
                      size={20}
                      className="cursor-pointer"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center md:flex-row">
              <p className="mb-2 w-full font-semibold md:mb-0 md:w-1/3">
                New Password:
              </p>
              <div className="relative w-full md:w-2/3">
                <input
                  type={showNewPassword ? "text" : "password"}
                  {...register("newPassword", {
                    required: "New Password field is required!",
                    pattern: {
                      value:
                        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]).{8,}$/,
                      message: "New Password must meet the criteria",
                    },
                  })}
                  placeholder="Enter new password"
                  className="w-full rounded-md border border-[#CCCCCC] px-4 py-2 text-[#737373]"
                />
                {errors.newPassword && (
                  <span className="text-red-500">
                    {errors.newPassword.message}
                  </span>
                )}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-base leading-5">
                  {!showNewPassword ? (
                    <FaEyeSlash
                      size={20}
                      className="cursor-pointer"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    />
                  ) : (
                    <FaEye
                      size={20}
                      className="cursor-pointer"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col items-center md:flex-row">
              <p className="mb-2 w-full font-semibold md:mb-0 md:w-1/3">
                Confirm New Password:
              </p>
              <div className="relative w-full md:w-2/3">
                <input
                  type={showConfirmNewPassword ? "text" : "password"}
                  {...register("confirmNewPassword", {
                    required: "Confirm password field is required!",
                    validate: (value) =>
                      value === watch("newPassword") ||
                      "Passwords do not match",
                  })}
                  placeholder="Confirm new password"
                  className="w-full rounded-md border border-[#CCCCCC] px-4 py-2 text-[#737373]"
                />
                {errors.confirmNewPassword && (
                  <span className="text-red-500">
                    {errors.confirmNewPassword.message}
                  </span>
                )}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-base leading-5">
                  {!showConfirmNewPassword ? (
                    <FaEyeSlash
                      size={20}
                      className="cursor-pointer"
                      onClick={() =>
                        setShowConfirmNewPassword(!showConfirmNewPassword)
                      }
                    />
                  ) : (
                    <FaEye
                      size={20}
                      className="cursor-pointer"
                      onClick={() =>
                        setShowConfirmNewPassword(!showConfirmNewPassword)
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="buttons mt-4 flex items-center gap-2">
        <Button
          type="submit"
          onClick={handleSubmit(onSubmit)}
          className="bg-[#174894] font-medium hover:bg-[#173094]"
        >
          Submit
        </Button>
        <Button
          className="rounded-md border border-[#CDCDCD] bg-gradient-to-b from-white to-[#CDCDCD] font-medium text-[#535353]"
          onClick={() => router.push("/mainapp/users")}
        >
          Cancel
        </Button>
        {/* <a
          href={`${getGoogleOAuthURL()}`}
          className="font-medium text-[#174894] underline hover:text-[#173094]"
        >
          Authorize access to your email box
        </a> */}
        <GmailLoginButton
          isLoggedIn={isGoogleLogin}
          email={googleLoggedInUser}
          onClick={() => {
            if (isGoogleLogin) {
              // disconnect current logged in user
              console.log("disconnect")
              disconnectGoogleUser()
            } else {
              const url = getGoogleOAuthURL(user_data?.organization)
              console.log("url", url)
              window.location.href = url
            }
          }}
        />
      </div>
    </div>
  )
}
