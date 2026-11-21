"use client";

import { useState } from "react";
import Link from "next/link";
import {
    BookOpen,
    CirclePlus,
    CloudOff,
    ExternalLink,
    Pencil,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/dashboard/PageHeader";
import DataTable from "@/components/dashboard/DataTable";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import StatusBadge from "@/components/ui/StatusBadge";
import { useApi } from "@/hooks/useApi";
import { api, ApiError } from "@/lib/api";
import { cn, formatFee } from "@/lib/utils";

const iconButton =
    "inline-flex size-9 items-center justify-center rounded-control transition-colors";

export default function MyTuitions() {
    const { data, error, isLoading, reload } = useApi("/tuitions/mine");
    const [busyId, setBusyId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const tuitions = data?.tuitions ?? [];
    const usage = data?.usage;

    function messageFrom(problem, fallback) {
        return problem instanceof ApiError ? problem.message : fallback;
    }

    async function toggle(row) {
        setBusyId(row._id);
        try {
            const result = await api.patch(`/tuitions/${row._id}/toggle`);
            toast.success(result?.message ?? "Updated.");
            reload();
        } catch (problem) {
            toast.error(messageFrom(problem, "Could not update the tuition."));
        } finally {
            setBusyId(null);
        }
    }

    async function confirmDelete() {
        setDeleting(true);
        try {
            const result = await api.delete(`/tuitions/${deleteTarget._id}`);
            toast.success(result?.message ?? "Tuition deleted.");
            setDeleteTarget(null);
            reload();
        } catch (problem) {
            toast.error(messageFrom(problem, "Could not delete the tuition."));
            if (problem.status === 404) {
                setDeleteTarget(null);
                reload();
            }
        } finally {
            setDeleting(false);
        }
    }

    const columns = [
        {
            key: "tuition",
            header: "Tuition",
            render: (row) => (
                <div className="flex min-w-0 items-center gap-3">
                    <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-primary-soft">
                        {row.bannerImage ? (
                            <img src={row.bannerImage} alt="" className="size-full object-cover" />
                        ) : (
                            <span className="flex size-full items-center justify-center text-link">
                                <BookOpen className="size-5" aria-hidden="true" />
                            </span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="line-clamp-1 font-semibold text-ink">{row.title}</p>
                        <p className="text-xs text-muted">
                            {row.subject} · {row.classLevel} · {row.mode}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: "monthlyFee",
            header: "Monthly fee",
            className: "whitespace-nowrap font-semibold text-ink",
            render: (row) => formatFee(row.monthlyFee),
        },
        {
            key: "approvalStatus",
            header: "Approval",
            render: (row) => <StatusBadge status={row.approvalStatus} />,
        },
        {
            key: "isActive",
            header: "Availability",
            render: (row) => <StatusBadge status={row.isActive ? "active" : "closed"} />,
        },
        { key: "applicantCount", header: "Applicants", className: "text-muted" },
        {
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            className: "text-right",
            render: (row) => {
                const isPublic = row.approvalStatus === "approved" && row.isActive;
                return (
                    <div className="flex items-center justify-end gap-1">
                        {isPublic && (
                            <Link
                                href={`/tuitions/${row._id}`}
                                aria-label="View public page"
                                title="View public page"
                                className={cn(iconButton, "text-muted hover:bg-surface-2 hover:text-ink")}
                            >
                                <ExternalLink className="size-[18px]" aria-hidden="true" />
                            </Link>
                        )}
                        <Link
                            href={`/dashboard/tutor/my-tuitions/${row._id}/edit`}
                            aria-label="Edit tuition"
                            title={row.approvalStatus === "rejected" ? "Edit and resubmit" : "Edit"}
                            className={cn(iconButton, "text-muted hover:bg-surface-2 hover:text-ink")}
                        >
                            <Pencil className="size-[18px]" aria-hidden="true" />
                        </Link>
                        <button
                            type="button"
                            onClick={() => toggle(row)}
                            disabled={busyId === row._id}
                            className="h-9 rounded-control px-3 text-sm font-semibold text-link transition-colors hover:bg-primary-soft disabled:opacity-50"
                        >
                            {row.isActive ? "Close" : "Reopen"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setDeleteTarget(row)}
                            aria-label="Delete tuition"
                            title="Delete"
                            className={cn(iconButton, "text-danger hover:bg-danger-soft")}
                        >
                            <Trash2 className="size-[18px]" aria-hidden="true" />
                        </button>
                    </div>
                );
            },
        },
    ];

    return (
        <div>
            <PageHeader
                title="My tuitions"
                description="Manage your posts: edit the details, close a tuition to stop new applications, or delete it."
                actions={
                    <Button href="/dashboard/tutor/post-tuition">
                        <CirclePlus className="size-4" aria-hidden="true" />
                        Post new tuition
                    </Button>
                }
            />

            {usage && usage.limit !== null && (
                <p className="mb-5 rounded-control bg-surface-2 px-4 py-3 text-sm text-muted">
                    Free plan:{" "}
                    <span className="font-semibold text-ink">
                        {usage.posted} of {usage.limit}
                    </span>{" "}
                    tuition posts used.
                </p>
            )}

            {error ? (
                <EmptyState
                    icon={CloudOff}
                    title="We couldn't load your tuitions"
                    description={error.message}
                >
                    <Button variant="outline" onClick={reload}>
                        Try again
                    </Button>
                </EmptyState>
            ) : isLoading && !data ? (
                <Skeleton className="h-80 w-full rounded-card" />
            ) : (
                <DataTable
                    columns={columns}
                    rows={tuitions}
                    getRowKey={(row) => row._id}
                    empty={
                        <EmptyState
                            icon={BookOpen}
                            title="You haven't posted any tuition yet"
                            description="Post your first tuition and an admin will review it."
                        >
                            <Button href="/dashboard/tutor/post-tuition">Post a tuition</Button>
                        </EmptyState>
                    }
                />
            )}

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete this tuition?"
                description={
                    deleteTarget
                        ? `"${deleteTarget.title}" will be removed${deleteTarget.applicantCount > 0
                            ? ` along with its ${deleteTarget.applicantCount} application${deleteTarget.applicantCount === 1 ? "" : "s"}`
                            : ""
                        }. This cannot be undone.`
                        : undefined
                }
                confirmLabel="Yes, delete it"
                cancelLabel="Keep it"
                loading={deleting}
                onConfirm={confirmDelete}
                onClose={() => !deleting && setDeleteTarget(null)}
            />
        </div>
    );
}