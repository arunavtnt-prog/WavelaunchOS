'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Send, Check, Paperclip, MoreHorizontal, Search, FileText, Calendar, User } from 'lucide-react'

interface MessageThread {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  unread: boolean
  online: boolean
}

const MessageThreadCard: React.FC<MessageThread> = ({ name, lastMessage, timestamp, unread, online }) => {
  return (
    <Link
      href="#"
      className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#2563EB] hover:bg-gray-50 transition-all group"
    >
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <User className="h-6 w-6 text-gray-500" />
        </div>
        {online && (
          <div className="absolute -bottom-0 -right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="text-sm font-medium text-gray-900">{name}</p>
            <p className="text-xs text-gray-500 line-clamp-1">{lastMessage}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{timestamp}</span>
            {unread && (
              <span className="bg-[#2563EB] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                New
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data for demonstration
  const messageThreads: MessageThread[] = [
    {
      id: '1',
      name: 'Wavelaunch Support',
      lastMessage: 'Your business plan has been approved and is ready for review. Let me know if you have any questions.',
      timestamp: '2h ago',
      unread: true,
      online: true,
    },
    {
      id: '2',
      name: 'Account Manager',
      lastMessage: 'Thanks for submitting your monthly content. Looking great this quarter!',
      timestamp: '1d ago',
      unread: true,
      online: false,
    },
    {
      id: '3',
      name: 'Wavelaunch Support',
      lastMessage: 'Here are the analytics for your recent launch. Numbers are looking promising!',
      timestamp: '3d ago',
      unread: false,
      online: true,
    },
    {
      id: '4',
      name: 'Account Manager',
      lastMessage: 'Reminder: Monthly deliverable due in 5 days',
      timestamp: '1w ago',
      unread: false,
      online: false,
    },
  ]

  const filteredThreads = messageThreads.filter(
    (thread) =>
      thread.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6 max-w-7xl">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
        </div>

        {/* Message Threads */}
        <div className="space-y-3">
          {filteredThreads.map((thread) => (
            <MessageThreadCard key={thread.id} {...thread} />
          ))}
        </div>
      </div>
    </div>
  )
}
