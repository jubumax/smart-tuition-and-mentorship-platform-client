"use client";

import { useRouter } from "next/navigation";
import { Crown, Lock } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import TuitionForm from "@/components/dashboard/TuitionForm";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { useApi } from "@/hooks/useApi";


export default function PostTuition() {
    const router = useRouter();
    const { data, isLoading } = useApi("/tuitions/mine");

    const usage = data?.usage;
    const limitReached = usage && usage.limit !== null && usage.posted >= usage.limit;

    return (
        <div className="mx-auto max-w-3xl">
            <PageHeader
                title="Post a new tuition"
                description="Fill in the details below. An admin reviews every tuition before it appears on the Browse page."
            />

            {usage && usage.limit !== null && (
                <p className="mb-5 rounded-control bg-surface-2 px-4 py-3 text-sm text-muted">
                    Free plan: <span className="font-semibold text-ink">{usage.posted} of {usage.limit}</span>{" "}
                    tuition posts used.
                </p>
            )}

            {isLoading && !data ? (
                <Skeleton className="h-[40rem] w-full rounded-card" />
            ) : limitReached ? (
                <EmptyState
                    icon={Lock}
                    title="You've reached the free plan limit"
                    description={`The free plan allows ${usage.limit} tuition posts. Upgrade to Pro for unlimited posts and a verified badge, or delete an old tuition to free a slot.`}
                >
                    <Button href="/pricing" variant="accent">
                        <Crown className="size-4" aria-hidden="true" />
                        Upgrade to Pro
                    </Button>
                </EmptyState>
            ) : (
                <TuitionForm onSaved={() => router.push("/dashboard/tutor/my-tuitions")} />
            )}
        </div>
    );
}