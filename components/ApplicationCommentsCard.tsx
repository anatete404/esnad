'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AtSign,
  Loader2,
  MessageSquare,
  Send,
  Trash2,
  User,
  X,
} from 'lucide-react'

type Comment = {
  id: string
  content: string
  mentionedIds: string[]
  createdAt: string
  author: {
    id: string
    fullName: string
    role: { nameAr: string }
  }
}

type Staff = {
  id: string
  fullName: string
  role: { nameAr: string; key: string }
}

type Props = {
  applicationId: string
  currentUserId: string
}

export default function ApplicationCommentsCard({
  applicationId,
  currentUserId,
}: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [content, setContent] = useState('')
  const [mentionedIds, setMentionedIds] = useState<string[]>([])
  const [showMentions, setShowMentions] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [commentsResponse, staffResponse] = await Promise.all([
        fetch(`/api/staff/applications/${applicationId}/comments`),
        fetch('/api/staff/users/selectable'),
      ])
      if (commentsResponse.ok) {
        const data = await commentsResponse.json()
        setComments(data.comments || [])
      }
      if (staffResponse.ok) {
        const users = await staffResponse.json()
        setStaff(users)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId])

  const send = async () => {
    if (!content.trim()) return
    setSending(true)
    setError('')
    try {
      const response = await fetch(`/api/staff/applications/${applicationId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          mentionedIds: mentionedIds.length > 0 ? mentionedIds : undefined,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'فشل الإرسال')
        return
      }
      setContent('')
      setMentionedIds([])
      await load()
      setTimeout(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
      }, 100)
    } catch {
      setError('تعذّر الاتصال')
    } finally {
      setSending(false)
    }
  }

  const deleteComment = async (id: string) => {
    if (!confirm('هل تريد حذف هذه الرسالة؟')) return
    setDeleteLoading(id)
    try {
      const response = await fetch(`/api/staff/comments/${id}`, { method: 'DELETE' })
      if (response.ok) await load()
    } finally {
      setDeleteLoading(null)
    }
  }

  const toggleMention = (id: string) => {
    setMentionedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id].slice(0, 10),
    )
  }

  return (
    <div className="rounded-[18px] bg-white border border-black/5 overflow-hidden">
      <div className="bg-[#f9fbf9] px-5 py-3.5 border-b border-black/5 flex items-center justify-between">
        <h3 className="font-extrabold text-[14px] flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#0d7a3e]" />
          المناقشات الداخلية
        </h3>
        <span className="text-[11px] text-black/50 font-bold">{comments.length} رسالة</span>
      </div>

      {error && (
        <div className="m-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px] font-semibold p-3 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold">×</button>
        </div>
      )}

      <div ref={listRef} className="max-h-[400px] overflow-y-auto p-4 space-y-3 bg-[#fbfcfb]">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#0d7a3e]" /></div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-10 h-10 mx-auto text-black/15" />
            <div className="mt-2 text-[13px] font-bold text-black/40">لا توجد رسائل بعد</div>
            <div className="mt-1 text-[11px] text-black/40">ابدأ مناقشة داخلية حول هذا الطلب</div>
          </div>
        ) : (
          comments.map((comment) => {
            const isOwn = comment.author.id === currentUserId
            return (
              <div key={comment.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-full grid place-items-center shrink-0 text-[12px] font-extrabold text-white ${isOwn ? 'bg-[#0d7a3e]' : 'bg-[#0a0f0d]'}`}>
                  {comment.author.fullName.charAt(0)}
                </div>
                <div className={`flex-1 max-w-[80%] ${isOwn ? 'text-left' : ''}`}>
                  <div className={`flex items-center gap-2 text-[11px] ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <span className="font-bold">{comment.author.fullName}</span>
                    <span className="px-1.5 py-0.5 rounded bg-black/5 text-black/55 text-[10px] font-bold">{comment.author.role.nameAr}</span>
                    <span className="text-black/40 text-[10px]">{new Date(comment.createdAt).toLocaleString('ar-EG', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`mt-1.5 rounded-[14px] px-4 py-2.5 text-[13px] leading-7 whitespace-pre-wrap ${isOwn ? 'bg-[#0d7a3e] text-white' : 'bg-white border border-black/5 text-black/85'}`}>
                    {comment.content}
                  </div>
                  {comment.mentionedIds.length > 0 && (
                    <div className={`mt-1.5 flex flex-wrap gap-1 ${isOwn ? 'justify-start' : ''}`}>
                      {comment.mentionedIds.map((mentionedId) => {
                        const user = staff.find((item) => item.id === mentionedId)
                        if (!user) return null
                        return <span key={mentionedId} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#c89a2c]/15 text-[#7a5d1a] text-[10px] font-bold"><AtSign className="w-2.5 h-2.5" />{user.fullName}</span>
                      })}
                    </div>
                  )}
                  {isOwn && (
                    <button onClick={() => void deleteComment(comment.id)} disabled={deleteLoading === comment.id} className="mt-1 inline-flex items-center gap-1 text-[10px] text-red-500 hover:text-red-700 font-bold disabled:opacity-40">
                      {deleteLoading === comment.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Trash2 className="w-2.5 h-2.5" />} حذف
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="p-4 border-t border-black/5 bg-white">
        {showMentions && (
          <div className="mb-3 rounded-xl border border-black/10 bg-[#f9fbf9] p-2 max-h-[180px] overflow-y-auto">
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-[11px] font-bold text-black/60">اختر من تريد الإشارة إليهم ({mentionedIds.length}/10)</span>
              <button onClick={() => setShowMentions(false)} className="w-5 h-5 rounded-full bg-black/5 grid place-items-center"><X className="w-3 h-3" /></button>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {staff.filter((user) => user.id !== currentUserId).map((user) => {
                const selected = mentionedIds.includes(user.id)
                return <button key={user.id} onClick={() => toggleMention(user.id)} className={`text-right flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] transition ${selected ? 'bg-[#0d7a3e] text-white font-bold' : 'hover:bg-white text-black/70'}`}><User className="w-3 h-3 shrink-0" /><span className="truncate">{user.fullName}</span></button>
              })}
            </div>
          </div>
        )}

        {mentionedIds.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {mentionedIds.map((id) => {
              const user = staff.find((item) => item.id === id)
              if (!user) return null
              return <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0d7a3e]/10 text-[#0d5a2e] text-[10px] font-bold"><AtSign className="w-2.5 h-2.5" />{user.fullName}<button onClick={() => toggleMention(id)} className="hover:text-red-500"><X className="w-2.5 h-2.5" /></button></span>
            })}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <button onClick={() => setShowMentions((open) => !open)} className={`w-10 h-10 rounded-full grid place-items-center shrink-0 transition ${showMentions ? 'bg-[#c89a2c] text-white' : 'bg-black/5 hover:bg-black/10 text-black/60'}`} title="إشارة لموظف"><AtSign className="w-4 h-4" /></button>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void send()
              }
            }}
            placeholder="اكتب رسالتك... (Enter للإرسال، Shift+Enter لسطر جديد)"
            className="input flex-1"
            rows={2}
            maxLength={2000}
          />
          <button onClick={() => void send()} disabled={sending || !content.trim()} className="w-10 h-10 rounded-full bg-[#0d7a3e] hover:bg-[#0a5c2f] text-white grid place-items-center shrink-0 transition disabled:opacity-40 btn-press">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <div className="mt-1 text-[10px] text-black/40 text-left">{content.length}/2000</div>
      </div>
    </div>
  )
}
