import { use } from "react";
import UploadReview from "./UploadReview";

export default function Page({ params }) {
  const asyncParams = use(params); // ✅ Unwrap the async params
  return <UploadReview id={asyncParams.id} />;
}
