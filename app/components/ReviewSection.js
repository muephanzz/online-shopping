import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import Zoom from "react-medium-image-zoom";
import 'react-medium-image-zoom/dist/styles.css';
import moment from 'moment';
import Image from 'next/image';

export default function ReviewSection({ reviews }) {
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const openViewer = (imgs, index) => {
    setSelectedImages(imgs);
    setCurrentIndex(index);
    setShowModal(true);
  };

  const closeViewer = () => {
    setShowModal(false);
    setSelectedImages([]);
    setCurrentIndex(0);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentIndex((prev) => (prev + 1) % selectedImages.length),
    onSwipedRight: () => setCurrentIndex((prev) => (prev - 1 + selectedImages.length) % selectedImages.length),
    trackMouse: true,
  });

  return (
    <div>
      {reviews.length === 0 ? (
        <p className="text-gray-500 mb-20">No reviews yet. Be the first to review!</p>
      ) : (
        reviews.map((review) => (
        <div key={review.review_id} className="mb-6 border-b pb-4">
          <div className="flex items-center gap-3">
            <Image
              src={review.profiles?.avatar_url || "https://www.gravatar.com/avatar/?d=mp"}
              alt="User Avatar"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full border"
            />
            <h2>{review.username}</h2>
            <span className="text-gray-500 text-sm ml-2">
              {moment(review.created_at).format('MMMM Do YYYY, h:mm a')}
            </span>
          </div>

          <div className="ml-12 text-gray-600">
            <span>
              {Array.from({ length: review.rating }, (_, i) => (
                <span key={i} className="text-yellow-500 text-lg">⭐</span>
              ))}
            </span>
            <p className="mb-4">{review.comment}</p>

            <div className="flex gap-3 flex-wrap">
              {review.media_urls?.map((img, idx) => (
                <img
                  key={idx}
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/review-media/${img}`}
                  alt="Review Media"
                  className="w-24 h-24 rounded-md object-cover cursor-pointer"
                  loading="lazy"
                  onClick={() => openViewer(review.media_urls, idx)}
                />
              ))}
            </div>
          </div>
        </div>
      )))}

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
          onClick={closeViewer}
        >
          <div {...swipeHandlers} className="relative max-w-full max-h-full p-2">
            <Zoom>
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/review-media/${selectedImages[currentIndex]}`}
                alt="Full View"
                className="max-w-full max-h-[80vh] rounded-lg mx-auto"
              />
            </Zoom>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex - 1 + selectedImages.length) % selectedImages.length); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-30 text-white text-2xl px-3 py-1 rounded-full"
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex + 1) % selectedImages.length); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-30 text-white text-2xl px-3 py-1 rounded-full"
            >
              ›
            </button>
            <button
              onClick={closeViewer}
              className="absolute top-4 right-4 text-white text-xl bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
