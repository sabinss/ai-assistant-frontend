"use client"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from "@/config/http";
import { FaRegUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import useAuth from "@/store/user";

interface FormData {
    first_name: string;
    last_name: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    role: string;
    status: string
}

export default function EditProfile({ params }: { params: { id: string } }) {
    const { user_data, access_token } = useAuth(); // Call useAuth here
    const [showChange, setShowChange] = useState(false);
    const user_id = params.id;
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
    const [status, setStatus] = useState<{ id: string; name: string }[]>([]);

    const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<FormData>();

    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                const [userData, roleData, statusData] = await Promise.all([
                    http.get(`/user/${user_id}`, {
                        headers: {
                            Authorization: `Bearer ${access_token}`
                        }
                    }),
                    http.get("/roles", {
                        headers: {
                            Authorization: `Bearer ${access_token}`
                        }
                    }),
                    http.get("/status", {
                        headers: {
                            Authorization: `Bearer ${access_token}`
                        }
                    })
                ]);
                setRoles(roleData?.data.map((role: any) => ({ id: role._id, name: role.name })));
                const { first_name, last_name, email, role, status } = userData?.data?.user;
                setValue("first_name", first_name);
                setValue("last_name", last_name);
                setValue("email", email);
                setValue("role", role.name);
                setValue("status", status?.name);
                setStatus(statusData?.data.map((item: any) => ({ id: item._id, name: item.name })));
            } catch (error) {
                console.error("Failed to fetch data", error);
                toast.error("Failed to load data.");
            }
        }

        fetchData();
    }, []);

    const handlePasswordToggle = () => {
        setShowChange(!showChange);
        setValue("newPassword", "");
        setValue("confirmNewPassword", "");
        setValue('currentPassword', "");
    }

    const onSubmit = async (data: FormData) => {
        const selectedRole = roles.find(role => role.name === data.role);
        const selectedStatus = status?.find(item => item?.name === data?.status)
        const updatedData = { ...data, role: selectedRole?.id, status: selectedStatus?.id };
        try {
            await http.patch(`/user/${user_id}`, updatedData, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });
            toast.success("Profile updated successfully!");
            router.push('/mainapp/users');
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error("Failed to update profile. Please try again.");
        }
    };

    return (
        <div className="w-full bg-white rounded-md p-4 text-[#333333]">
            <p className="text-2xl mb-6">Edit Profile</p>
            {/* User Details */}
            <div className="userDetails text-base flex flex-col gap-4">
                {/* Email */}
                <div className="flex flex-col md:flex-row items-center">
                    <p className="w-full md:w-1/3 font-semibold mb-2 md:mb-0">Email:</p>
                    <input
                        type="text"
                        disabled
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Invalid email address"
                            }
                        })}
                        placeholder="john@example.com"
                        className="text-[#737373] px-4 py-2 border-[#CCCCCC] border rounded-md cursor-not-allowed w-full"
                    />
                    {errors.email && <span className="text-red-500">{errors.email.message}</span>}
                </div>
                {/* First Name */}
                <div className="flex flex-col md:flex-row items-center">
                    <p className="w-full md:w-1/3 font-semibold mb-2 md:mb-0">First Name:</p>
                    <input
                        type="text"
                        {...register("first_name", { required: "First name is required" })}
                        placeholder="John"
                        className="text-[#737373] px-4 py-2 border-[#CCCCCC] border rounded-md w-full"
                    />
                    {errors.first_name && <span className="text-red-500">{errors.first_name.message}</span>}
                </div>

                {/* Last Name */}
                <div className="flex flex-col md:flex-row items-center">
                    <p className="w-full md:w-1/3 font-semibold mb-2 md:mb-0">Last Name:</p>
                    <input
                        type="text"
                        {...register("last_name", { required: "Last name is required" })}
                        placeholder="Doe"
                        className="text-[#737373] px-4 py-2 border-[#CCCCCC] border rounded-md w-full"
                    />
                    {errors.last_name && <span className="text-red-500">{errors.last_name.message}</span>}
                </div>


                {/* Role */}
                <div className="flex flex-col md:flex-row items-center">
                    <p className="w-full md:w-1/3 font-semibold mb-2 md:mb-0">Role:</p>
                    <select
                        disabled={user_data?.user_id === user_id}
                        {...register("role")}
                        value={watch("role")}
                        className="text-[#737373] px-4 py-2 border-[#CCCCCC] border rounded-md disabled:cursor-not-allowed w-full"
                    >
                        {roles.map(role => (
                            <option key={role.id} value={role.name}>
                                {role.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center mt-3">
                <p className="w-full md:w-1/3 font-semibold mb-2 md:mb-0">Status:</p>
                <select
                    {...register("status")}
                    disabled={user_data?.user_id === user_id}
                    value={watch("status")}
                    className="text-[#737373] px-4 py-2 border-[#CCCCCC] border rounded-md disabled:cursor-not-allowed w-full"
                >
                    {status?.map(item => (
                        <option key={item?.id} value={item?.name}>
                            {item?.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Change Password */}
            <div className="changePassword mt-2">
                <p className="text-xl mb-6">
                    Change Password <Switch className="ml-2 text-sm" id="showpwchange" onCheckedChange={handlePasswordToggle} />
                </p>
                {showChange && (
                    <div className="form flex flex-col gap-4">

                        {/* New Password */}
                        <div className="flex flex-col md:flex-row items-center mt-4">
                            <p className="text-[14px] text-red-500 mb-2 md:mb-0">Your password must be 8 character long, combined with uppercase, numbers and symbols.</p>
                        </div>
                        {
                            user_data?.user_id === user_id && (
                                <div className="flex flex-col md:flex-row items-center">
                                    <p className="font-semibold w-full md:w-1/3 mb-2 md:mb-0">Current Password:</p>
                                    <div className="relative w-full md:w-2/3">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            {...register("currentPassword", {
                                                required: 'Current password field is required!',
                                            })}
                                            placeholder="Enter Current password"
                                            className="text-[#737373] px-4 py-2 w-full border-[#CCCCCC] border rounded-md"
                                        />
                                        {errors?.currentPassword && <span className="text-red-500">{errors?.currentPassword?.message}</span>}
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-base leading-5">
                                            {!showCurrentPassword ? (
                                                <FaEyeSlash
                                                    size={20}
                                                    className="cursor-pointer"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                />
                                            ) : (
                                                <FaEye
                                                    size={20}
                                                    className="cursor-pointer"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        <div className="flex flex-col md:flex-row items-center">
                            <p className="font-semibold w-full md:w-1/3 mb-2 md:mb-0">New Password:</p>
                            <div className="relative w-full md:w-2/3">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    {...register("newPassword", {
                                        required: 'New Password field is required!',
                                        pattern: {
                                            value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]).{8,}$/,
                                            message: "New Password must meet the criteria"
                                        }
                                    })}
                                    placeholder="Enter new password"
                                    className="text-[#737373] px-4 py-2 w-full border-[#CCCCCC] border rounded-md"
                                />
                                {errors.newPassword && <span className="text-red-500">{errors.newPassword.message}</span>}
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-base leading-5">
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
                        <div className="flex flex-col md:flex-row items-center">
                            <p className="font-semibold w-full md:w-1/3 mb-2 md:mb-0">Confirm New Password:</p>
                            <div className="relative w-full md:w-2/3">
                                <input
                                    type={showConfirmNewPassword ? "text" : "password"}
                                    {...register("confirmNewPassword", {
                                        required: 'Confirm password field is required!',
                                        validate: (value) =>
                                            value === watch("newPassword") || "Passwords do not match"
                                    })}
                                    placeholder="Confirm new password"
                                    className="text-[#737373] px-4 py-2 w-full border-[#CCCCCC] border rounded-md"
                                />
                                {errors.confirmNewPassword && <span className="text-red-500">{errors.confirmNewPassword.message}</span>}
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-base leading-5">
                                    {!showConfirmNewPassword ? (
                                        <FaEyeSlash
                                            size={20}
                                            className="cursor-pointer"
                                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                        />
                                    ) : (
                                        <FaEye
                                            size={20}
                                            className="cursor-pointer"
                                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Buttons */}
            <div className="buttons flex gap-2 mt-4">
                <Button type="submit" onClick={handleSubmit(onSubmit)} className="bg-[#174894] font-medium hover:bg-[#173094]">
                    Submit
                </Button>
                <Button className="bg-gradient-to-b from-white to-[#CDCDCD] border-[#CDCDCD] border text-[#535353] font-medium rounded-md" onClick={() => router.push('/mainapp/users')}>
                    Cancel
                </Button>
            </div>

        </div>
    );
}
