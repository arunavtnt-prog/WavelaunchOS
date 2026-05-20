'use client'

import React, { useState } from 'react'
import { User, Bell, Lock, MoreHorizontal, Check } from 'lucide-react'

const SectionCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [email, setEmail] = useState('user@example.com')
  const [notifications, setNotifications] = useState({
    newDeliverable: true,
    newMessage: true,
    milestoneReminder: true,
    weeklySummary: false,
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6 max-w-7xl">
        {/* Account Information */}
        <SectionCard
          title="Account Information"
          description="Your profile and account details"
          icon={<User className="h-5 w-5 text-gray-400" />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-500 mb-1">Email</label>
              <p className="text-lg font-semibold text-gray-900">{email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1">Email Verified</label>
              <span className="bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                Verified
              </span>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1">Creator Name</label>
              <p className="text-lg font-semibold text-gray-900">Creator Name</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1">Brand Name</label>
              <p className="text-lg font-semibold text-gray-900">Brand Name</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1">Last Login</label>
              <p className="text-lg font-semibold text-gray-900">Today</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1">Member Since</label>
              <p className="text-lg font-semibold text-gray-900">Jan 2024</p>
            </div>
          </div>
        </SectionCard>

        {/* Security Settings */}
        <SectionCard
          title="Security"
          description="Manage your password and security settings"
          icon={<Lock className="h-5 w-5 text-gray-400" />}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 mb-2">Current Password</label>
              <input
                type="password"
                value="•••••••••••"
                readOnly
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <button className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium py-2.5 rounded-lg transition-colors">
              Change Password
            </button>
          </div>
        </SectionCard>

        {/* Notification Preferences */}
        <SectionCard
          title="Notification Preferences"
          description="Choose which notifications you want to receive"
          icon={<Bell className="h-5 w-5 text-gray-400" />}
        >
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-gray-100 rounded-full border-2 flex items-center justify-center">
                  <Check className="h-4 w-4 text-[#2563EB]" />
                </div>
                <span className="text-sm font-medium text-gray-900">Notify when new deliverable is ready</span>
              </div>
              <div className={`w-10 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                notifications.newDeliverable ? 'bg-[#2563EB] border-[#2563EB]' : 'bg-gray-100 border-gray-200'
              }`}>
                <Check className="h-4 w-4 text-white" />
              </div>
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-gray-100 rounded-full border-2 flex items-center justify-center">
                  <Check className="h-4 w-4 text-[#2563EB]" />
                </div>
                <span className="text-sm font-medium text-gray-900">Notify when new message arrives</span>
              </div>
              <div className={`w-10 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                notifications.newMessage ? 'bg-[#2563EB] border-[#2563EB]' : 'bg-gray-100 border-gray-200'
              }`}>
                <Check className="h-4 w-4 text-white" />
              </div>
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-gray-100 rounded-full border-2 flex items-center justify-center">
                  <Check className="h-4 w-4 text-[#2563EB]" />
                </div>
                <span className="text-sm font-medium text-gray-900">Send milestone reminders</span>
              </div>
              <div className={`w-10 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                notifications.milestoneReminder ? 'bg-[#2563EB] border-[#2563EB]' : 'bg-gray-100 border-gray-200'
              }`}>
                <Check className="h-4 w-4 text-white" />
              </div>
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-gray-100 rounded-full border-2 flex items-center justify-center">
                  <Check className="h-4 w-4 text-[#2563EB]" />
                </div>
                <span className="text-sm font-medium text-gray-900">Receive weekly summary email</span>
              </div>
              <div className={`w-10 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                notifications.weeklySummary ? 'bg-[#2563EB] border-[#2563EB]' : 'bg-gray-100 border-gray-200'
              }`}>
                <Check className="h-4 w-4 text-white" />
              </div>
            </label>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
