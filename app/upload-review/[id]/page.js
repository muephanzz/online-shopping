import { use } from "react";
import UploadReview from "./UploadReview";

export default function Page({ params }) {
  const asyncParams = use(params);
  return <UploadReview id={asyncParams.id} />;
}
