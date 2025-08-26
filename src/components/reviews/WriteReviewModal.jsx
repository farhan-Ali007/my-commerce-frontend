import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { AiOutlineClose } from "react-icons/ai";
import toast from "react-hot-toast";
import { createProductReview } from "../../functions/product";

const WriteReviewModal = ({ open, onClose, onSubmitted, slug, product }) => {
  const { user } = useSelector((s) => s.auth);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const onPick = () => fileRef.current?.click();
  const onFiles = (e) => {
    let f = Array.from(e.target.files || []);
    if (files.length + f.length > 5) {
      f = f.slice(0, 5 - files.length);
      toast.error("Max 5 images");
    }
    setFiles((prev) => [...prev, ...f]);
    e.target.value = null;
  };
  const removeIdx = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e?.preventDefault();
    if (!user) {
      toast.error("Please log in to write a review");
      return;
    }
    if (!rating || !review) {
      toast.error("Please add rating and review");
      return;
    }
    const fd = new FormData();
    fd.append("email", user.email || "");
    fd.append("reviewText", review);
    fd.append("rating", rating);
    files.forEach((f) => fd.append("images", f));
    try {
      setLoading(true);
      await createProductReview(slug, user._id, fd);
      toast.success("Review submitted");
      setLoading(false);
      setRating(0);
      setReview("");
      setFiles([]);
      // Notify parent first so it can close any parent sheet, then close self
      try { onSubmitted?.(); } catch {}
      onClose?.();
    } catch (err) {
      setLoading(false);
      console.error("[WriteReviewModal] submit error", err);
      toast.error(err?.response?.data?.message || "Failed to submit review");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[10002] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[10003] flex items-center justify-center p-4"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
          >
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Write a store review</h3>
                <button onClick={onClose} className="p-2 rounded hover:bg-gray-100" aria-label="Close"><AiOutlineClose className="w-5 h-5"/></button>
              </div>
              <form className="p-4 space-y-4" onSubmit={submit}>
                <div>
                  <label className="block text-sm font-semibold mb-1">Rating</label>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setRating(v)}
                        aria-label={`Set rating ${v}`}
                        className="focus:outline-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-7 h-7 ${rating >= v ? "text-yellow-500" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Review</label>
                  <textarea
                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-gray-200"
                    rows={5}
                    maxLength={2000}
                    placeholder="Share your feedback with us"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />
                  <div className="text-xs text-gray-500 text-right">{review.length}/2000</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Add photos (max 5)</label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button type="button" onClick={onPick} className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700">+
                    </button>
                    {files.map((f, i) => (
                      <div key={i} className="relative">
                        <img src={URL.createObjectURL(f)} alt="preview" className="w-20 h-20 object-cover rounded-lg" />
                        <button type="button" onClick={() => removeIdx(i)} className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center">×</button>
                      </div>
                    ))}
                    <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
                  </div>
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-secondary text-primary font-semibold hover:brightness-110 disabled:opacity-60">
                    {loading ? "Submitting…" : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WriteReviewModal;
