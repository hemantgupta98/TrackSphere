"use client";

import React from "react";
import { useForm } from "react-hook-form";

type FormData = {
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  permissions: string[];
  department: string;
  employeeId: string;
  region: string;
  status: string;
  twoFactor: boolean;
  notes: string;
};

const permissionsList = [
  "Manage Users",
  "View Reports",
  "Manage Rides",
  "Payment Access",
  "System Settings",
];

export default function AdminFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log("Admin Data:", data);
    alert("Admin Created Successfully!");
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-zinc-900 rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Registration</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Full Name"
                {...register("name", { required: true })}
                className="input"
              />
              <input
                placeholder="Username"
                {...register("username")}
                className="input"
              />
              <input
                placeholder="Email"
                {...register("email", { required: true })}
                className="input"
              />
              <input
                placeholder="Phone Number"
                {...register("phone")}
                className="input"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Role & Permissions</h2>

            <select {...register("role")} className="input mb-4">
              <option value="">Select Role</option>
              <option value="super">Super Admin</option>
              <option value="sub">Sub Admin</option>
              <option value="support">Support Admin</option>
            </select>

            <div className="grid grid-cols-2 gap-2">
              {permissionsList.map((perm) => (
                <label key={perm} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={perm}
                    {...register("permissions")}
                  />
                  {perm}
                </label>
              ))}
            </div>
          </div>

          {/* Work Info */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Work Info</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Department"
                {...register("department")}
                className="input"
              />
              <input
                placeholder="Employee ID"
                {...register("employeeId")}
                className="input"
              />
              <input
                placeholder="Region / City"
                {...register("region")}
                className="input"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Account Status</h2>

            <select {...register("status")} className="input">
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Security */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Security</h2>

            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("twoFactor")} />
              Enable 2FA
            </label>
          </div>

          {/* Notes */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Notes</h2>

            <textarea
              placeholder="Additional notes..."
              {...register("notes")}
              className="input h-24"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Create Admin
          </button>
        </form>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          background: #18181b;
          border: 1px solid #333;
          outline: none;
        }
        .input:focus {
          border-color: white;
        }
      `}</style>
    </div>
  );
}
