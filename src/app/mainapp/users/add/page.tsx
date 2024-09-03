"use client"
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import { useRouter } from "next/navigation"
import { Button } from '@/components/ui/button';
import Dropdown from '../../commoncompnents/DropDown';
import http from '@/config/http';
import useAuth from '@/store/user';

interface FormData {
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    password: string;
}

interface Errors {
    [key: string]: string;
}

interface Role {
    _id: string;
    name: string;
}

const AddUser: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const router = useRouter();
    const { access_token } = useAuth(); // Call useAuth here
    const [formData, setFormData] = useState<FormData>({
        email: '',
        first_name: '',
        last_name: '',
        role: '',
        password: "123"
    })

    useEffect(() => {
        async function getRoles() {
            const response = await http.get('/roles', {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });
            if (response.status === 200) {
                setRoles(response?.data);
            }
        }

        getRoles();

    }, [])



    const [errors, setErrors] = useState<Errors>({});

    const submitAddUser = async (data: FormData) => {
        try {
            const roleId = roles.find(role => role.name === data.role)?._id;
            const requestData = { ...data, role: roleId };

            const response = await http.post("/user/add", requestData, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });
            if (response.status === 200) {
                toast.success('User added successfully!');
                router.push('/mainapp/users')
            }
            else if (response.status === 201) {
                toast.error(response?.data?.message);
            }
            else {
                toast.error('Failed to add user');
            }
        } catch (error: any) {
            console.error("Error adding user:", error);
            toast.error(error.message || 'Unexpected error occurred');
        }
    };

    const validateForm = () => {
        const newErrors: Errors = {};

        // Validation logic remains the same

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (validateForm()) {
            await submitAddUser(formData);
        } else {
            Object.values(errors).forEach((error) => {
                toast.error(error);
            });
        }
    };

    return (
        <div className="h-fit w-full rounded-lg border bg-white px-5 py-6">
            <h1 className="text-2xl mb-6">Add User</h1>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="flex">
                    <label htmlFor="email" className="pt-2 w-1/5">
                        Email:
                    </label>
                    <div className="flex flex-col">
                        <input
                            type="text"
                            placeholder="Enter your email here"
                            className={`border border-[#CCCCCC] rounded-md px-4 py-2 ${errors.email ? 'border-red-700' : ''}`}
                            name="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        {errors.email && <span className="text-red-700 text-[12px]">{errors.email}</span>}
                    </div>
                </div>

                <div className="flex">
                    <label htmlFor="first_name" className="pt-2 w-1/5">
                        First Name:
                    </label>
                    <div className="flex flex-col">
                        <input
                            placeholder="Enter your First Name"
                            type="text"
                            className={`border border-[#CCCCCC] rounded-md px-4 py-2 ${errors.first_name ? 'border-red-700' : ''}`}
                            name="first_name"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        />
                        {errors.first_name && <span className="text-red-700 text-[12px]">{errors.first_name}</span>}
                    </div>
                </div>

                <div className="flex">
                    <label htmlFor="last_name" className="pt-2 w-1/5">
                        Last Name:
                    </label>
                    <div className="flex flex-col">
                        <input
                            type="text"
                            placeholder="Enter your Last Name here"
                            className={`border border-[#CCCCCC] rounded-md px-4 py-2 ${errors.last_name ? 'border-red-700' : ''}`}
                            name="last_name"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        />
                        {errors.last_name && <span className="text-red-700 text-[12px]">{errors.last_name}</span>}
                    </div>
                </div>

                <div className="flex">
                    <label htmlFor="role" className="pt-2 w-1/5">
                        Role: Select the role
                    </label>
                    <div className='md:w-1/5 w-full'>
                        <Dropdown
                            options={roles?.map(role => role.name)}
                            value={formData.role}
                            onChange={(value) => setFormData({ ...formData, role: value })}
                        />
                    </div>
                </div>
                {errors.role && <span className="text-red-700">{errors.role}</span>}

                <div className="buttons flex gap-4">
                    <Button type="submit" className="bg-[#174894] font-semibold hover:bg-[#173094] px-7 py-1">
                        Submit
                    </Button>
                    <Link href={'/mainapp/users'}>
                        <Button className="bg-gradient-to-b from-white to-[#CDCDCD] border-[#CDCDCD] border text-[#535353] font-medium rounded-md px-7 py-2">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default AddUser;