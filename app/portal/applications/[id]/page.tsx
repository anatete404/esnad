"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowRightLeft,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  User,
  UserPlus,
  XCircle,
} from "lucide-react";
import ApplicationDetailsCard from "@/components/ApplicationDetailsCard";
import ApprovalChainCard from "@/components/ApprovalChainCard";
import ApplicationCommentsCard from "@/components/ApplicationCommentsCard";
import ContractManager from "@/components/ContractManager";
import HandoverModal from "@/components/HandoverModal";
import MapLink from "@/components/MapLink";

const STAGES = [
  "SUBMITTED",
  "INITIAL_REVIEW",
  "DOCS_REVIEW",
  "SURVEY",
  "PRICING",
  "COMMITTEE",
  "CONTRACT",
  "COMPLETED",
  "REJECTED",
];
const LABELS: Record<string, string> = {
  SUBMITTED: "تم التقديم",
  INITIAL_REVIEW: "مراجعة أولية",
  DOCS_REVIEW: "فحص المستندات",
  SURVEY: "معاينة ميدانية",
  PRICING: "تسعير",
  COMMITTEE: "عرض على اللجنة",
  CONTRACT: "تعاقد",
  COMPLETED: "منجز",
  REJECTED: "مرفوض",
};
type Detail = {
  id: string;
  trackingNumber: string;
  stage: string;
  status: string;
  statusNote: string | null;
  statusNoteManual: boolean;
  submittedAt: string;
  updatedAt: string;
  citizen: { fullName: string; nationalId: string; phone: string };
  land: {
    gov: string | null;
    center: string | null;
    village: string | null;
    detail: string | null;
    totalFaddan: number;
    authorityName: string | null;
    lat: string | null;
    lng: string | null;
  } | null;
  payments: Array<{
    id: string;
    type: string;
    amount: number;
    receiptNumber: string | null;
    receiptImageUrl: string | null;
    paidAt: string | null;
    notes: string | null;
  }>;
  documents: Array<{
    id: string;
    type: string;
    originalName: string;
    size: number;
    isVerified: boolean;
  }>;
  stages: Array<{
    id: string;
    toStage: string;
    notes: string | null;
    createdAt: string;
    user: { fullName: string } | null;
  }>;
  contract: {
    id: string;
    contractNo: string;
    createdAt: string;
    signedAt: string | null;
    value: number;
    paymentPlan: string | null;
  } | null;
  assignedTo: { id: string; fullName: string; email: string } | null;
};
type Staff = {
  id: string;
  fullName: string;
  role: { nameAr: string };
};

export default function StaffApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [app, setApp] = useState<Detail | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toStage, setToStage] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [docLoading, setDocLoading] = useState<string | null>(null);
  const [showHandover, setShowHandover] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  const load = async () => {
    const [res, staffRes] = await Promise.all([
      fetch(`/api/staff/applications/${id}`),
      fetch("/api/staff/users/selectable"),
    ]);
    if (res.status === 404) {
      router.push("/portal/applications");
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setApp(data.application);
      setCanEdit(data.permissions?.canEditPayments ?? false);
      setToStage(data.application.stage);
      setSelectedStaff(data.application.assignedTo?.id || "");
    }
    if (staffRes.ok) setStaff(await staffRes.json());
    setLoading(false);
  };
  useEffect(() => {
    if (id) void load();
  }, [id]);
  useEffect(() => {
    fetch("/api/auth/staff/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user?.id) setCurrentUserId(data.user.id);
        if (data?.user?.roleKey) setCurrentUserRole(data.user.roleKey);
      })
      .catch(() => {});
  }, []);
  const changeStage = async () => {
    if (!app || toStage === app.stage) return;
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/staff/applications/${id}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStage, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل النقل");
        return;
      }
      setSuccess("تم تحديث المرحلة بنجاح");
      setNotes("");
      await load();
    } catch {
      setError("تعذّر الاتصال");
    } finally {
      setActionLoading(false);
    }
  };
  const assign = async (assignedToId: string | null) => {
    setAssignLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/staff/applications/${id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل الإسناد");
        return;
      }
      setSuccess(assignedToId ? "تم إسناد الطلب" : "تم إلغاء الإسناد");
      await load();
    } catch {
      setError("تعذّر الاتصال");
    } finally {
      setAssignLoading(false);
    }
  };
  const verifyDoc = async (docId: string, verify: boolean) => {
    setDocLoading(docId);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(
        `/api/staff/applications/${id}/documents/${docId}/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verify }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل الاعتماد");
        return;
      }
      setSuccess(verify ? "تم اعتماد المستند" : "تم إلغاء الاعتماد");
      await load();
    } catch {
      setError("تعذّر الاتصال");
    } finally {
      setDocLoading(null);
    }
  };
  if (loading)
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-[#0d7a3e]" />
      </div>
    );
  if (!app) return null;
  return (
    <div className="space-y-6">
      <Link
        href="/portal/applications"
        className="inline-flex items-center gap-2 text-[13px] font-bold text-black/60 hover:text-black"
      >
        <ArrowRight className="w-4 h-4" />
        رجوع للطلبات
      </Link>
      <ApplicationDetailsCard
        application={app}
        applicationId={app.id}
        canEdit={canEdit}
      />
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 p-3">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 text-green-700 p-3">
          {success}
        </div>
      )}
      <div className="grid lg:grid-cols-[1.4fr_0.6fr] gap-6">
        <div className="space-y-6">
          <Card title="بيانات المواطن" icon={User}>
            <Info label="الاسم" value={app.citizen.fullName} />
            <Info label="الرقم القومي" value={app.citizen.nationalId} />
            <Info label="الهاتف" value={app.citizen.phone} />
          </Card>
          <Card title="بيانات الأرض" icon={MapPin}>
            {app.land && (
              <>
                <Info label="المحافظة" value={app.land.gov || "—"} />
                <Info label="المركز" value={app.land.center || "—"} />
                <Info label="القرية" value={app.land.village || "—"} />
                <MapLink lat={app.land.lat} lng={app.land.lng} />
                <Info
                  label="المساحة"
                  value={`${app.land.totalFaddan.toFixed(4)} فدان`}
                />
              </>
            )}
          </Card>
          <Card title={`المستندات (${app.documents.length})`} icon={FileText}>
            {app.documents.length === 0 ? (
              <div className="text-black/50">لا توجد مستندات</div>
            ) : (
              app.documents.map((doc) => (
                <div key={doc.id} className="flex justify-between border-b p-3">
                  <a
                    href={`/api/documents/${doc.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold"
                  >
                    {doc.originalName}
                  </a>
                  {doc.isVerified ? (
                    <button
                      onClick={() => void verifyDoc(doc.id, false)}
                      disabled={docLoading === doc.id}
                      className="text-green-700"
                    >
                      معتمد
                    </button>
                  ) : (
                    <button
                      onClick={() => void verifyDoc(doc.id, true)}
                      disabled={docLoading === doc.id}
                      className="text-[#0d7a3e] font-bold"
                    >
                      اعتماد
                    </button>
                  )}
                </div>
              ))
            )}
          </Card>
        </div>
        <div className="space-y-4">
          <div className="rounded-[18px] bg-white border border-black/5 p-5">
            <h3 className="font-extrabold">نقل المرحلة</h3>
            <select
              value={toStage}
              onChange={(e) => setToStage(e.target.value)}
              className="input mt-4"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {LABELS[s]}
                </option>
              ))}
            </select>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات (اختياري)"
              className="input mt-3"
            />
            <button
              onClick={() => void changeStage()}
              disabled={actionLoading || toStage === app.stage}
              className="w-full h-11 mt-3 rounded-full bg-[#0d7a3e] text-white font-bold disabled:opacity-40"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "تحديث المرحلة"
              )}
            </button>
          </div>
          <div className="rounded-[18px] bg-white border border-black/5 p-5">
            <h3 className="font-extrabold flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#0d7a3e]" />
              الإسناد
            </h3>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="input mt-4"
            >
              <option value="">— اختر موظف —</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.role.nameAr})
                </option>
              ))}
            </select>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => void assign(selectedStaff || null)}
                disabled={assignLoading || !selectedStaff}
                className="flex-1 h-10 rounded-full bg-[#0d7a3e] text-white font-bold disabled:opacity-40"
              >
                إسناد
              </button>
              {app.assignedTo && (
                <button
                  onClick={() => void assign(null)}
                  disabled={assignLoading}
                  className="h-10 px-3 rounded-full border border-red-200 text-red-600"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowHandover(true)}
              className="w-full h-10 mt-3 rounded-full border border-[#0d7a3e]/30 hover:border-[#0d7a3e] hover:bg-[#f0faf4] text-[#0d7a3e] font-bold text-[12px] flex items-center justify-center gap-2 transition"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              تسليم المهمة لموظف آخر
            </button>
          </div>
          <ContractManager
            applicationId={app.id}
            applicationStage={app.stage}
            applicationStatus={app.status}
            initialContract={app.contract}
            canEdit={canEdit}
            onRefresh={() => void load()}
          />
          {app.stage === "CONTRACT" || app.stage === "COMMITTEE" || app.stage === "COMPLETED" ? (
            <ApprovalChainCard
              applicationId={app.id}
              applicationStage={app.stage}
              currentUserRole={currentUserRole}
              onRefresh={() => void load()}
            />
          ) : null}
          <ApplicationCommentsCard
            applicationId={app.id}
            currentUserId={currentUserId}
          />
        </div>
      </div>
      {showHandover && (
        <HandoverModal
          applicationId={app.id}
          currentAssigneeId={app.assignedTo?.id || null}
          onClose={() => setShowHandover(false)}
          onSuccess={() => {
            setShowHandover(false);
            setSuccess("تم تسليم المهمة بنجاح");
            void load();
          }}
        />
      )}
    </div>
  );
}
function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[18px] bg-white border border-black/5 p-5">
      <h3 className="font-extrabold flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-[#0d7a3e]" />
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f9fbf9] border border-black/5 p-3">
      <div className="text-[10px] text-black/50 font-bold">{label}</div>
      <div className="mt-1 text-[12px] font-bold">{value}</div>
    </div>
  );
}
