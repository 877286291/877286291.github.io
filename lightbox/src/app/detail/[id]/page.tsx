import DetailPageClient from "@/components/DetailPageClient";

interface PageProps {
  params: { id: string };
}

export default function DetailPage({ params }: PageProps) {
  return <DetailPageClient id={params.id} />;
}
