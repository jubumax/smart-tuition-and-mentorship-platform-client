import EditTuition from "@/components/dashboard/EditTuition";

export const metadata = { title: "Edit tuition" };

export default async function EditTuitionPage({ params }) {
    const { id } = await params;
    return <EditTuition id={id} />;
}