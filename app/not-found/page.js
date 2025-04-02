import { notFound } from "next/navigation";

export default function Page({ params }) {
  if (!params.id) return notFound();
  return <h1>Product Page</h1>;
}
