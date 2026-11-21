"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, SearchX } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import TuitionForm from "@/components/dashboard/TuitionForm";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { useApi } from "@/hooks/useApi";

export default function EditTuition({ id }) {
    const router = useRouter();
    const { data, error, isLoading, reload } = useApi(`/tuitions/mine/${id}`);

    const tuition = data?.tuition;

    return (
        <div className="mx-auto max-w-3xl">
            <Link
                href="/dashboard/tutor/my-tuitions"
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-link"
            >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back to my tuitions
            </Link>

            <PageHeader
                title="Edit tuition"
                description="Update the details and save. Students see the new version right away."
            />

            {error ? (
                error.status === 404 ? (
                    <EmptyState
                        icon={SearchX}
                        title="Tuition not found"
                        description="It may have been deleted, or it belongs to another tutor."
                    >
                        <Button href="/dashboard/tutor/my-tuitions" variant="outline">
                            Back to my tuitions
                        </Button>
                    </EmptyState>
                ) : (
                    <EmptyState
                        icon={SearchX}
                        title="We couldn't load this tuition"
                        description={error.message}
                    >
                        <Button variant="outline" onClick={reload}>
                            Try again
                        </Button>
                    </EmptyState>
                )
            ) : isLoading && !tuition ? (
                <Skeleton className="h-[40rem] w-full rounded-card" />
            ) : (
                <>
                    {tuition.approvalStatus === "rejected" && (
                        <p className="mb-5 rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">
                            An admin rejected this tuition. Fix the details and save: it is sent for
                            review again.
                        </p>
                    )}
                    <TuitionForm
                        tuition={tuition}
                        submitLabel="Save changes"
                        onSaved={() => router.push("/dashboard/tutor/my-tuitions")}
                    />
                </>
            )}
        </div>
    );
}