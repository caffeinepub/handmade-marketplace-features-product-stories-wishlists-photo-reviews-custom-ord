import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAddReview } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import type { Review } from '../backend';
import { useMemo } from 'react';

interface ReviewSectionProps {
  productId: bigint;
  reviews: Review[];
  isLoading: boolean;
}

export function ReviewSection({ productId, reviews, isLoading }: ReviewSectionProps) {
  const { identity, login } = useInternetIdentity();
  const addReview = useAddReview();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please login to leave a review');
      login();
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    try {
      await addReview.mutateAsync({
        productId,
        rating: BigInt(rating),
        comment: comment.trim(),
        photos: [],
      });
      toast.success('Review submitted successfully!');
      setComment('');
      setRating(5);
      setShowForm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
    : 0;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.round(averageRating) ? 'fill-primary text-primary' : 'text-muted'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} out of 5 ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>
        {!showForm && (
          <Button onClick={() => identity ? setShowForm(true) : login()}>
            Write a Review
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${star <= rating ? 'fill-primary text-primary' : 'text-muted'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Your Review</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={addReview.isPending}>
                  {addReview.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Loading reviews...</p>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id.toString()} review={review} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          No reviews yet. Be the first to review this product!
        </p>
      )}
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const photoUrls = useMemo(() => {
    return review.photos.map((photo) => {
      const blob = new Blob([new Uint8Array(photo)], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    });
  }, [review.photos]);

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Number(review.rating) ? 'fill-primary text-primary' : 'text-muted'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(Number(review.timestamp) / 1000000).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <p className="text-sm">{review.comment}</p>
        {photoUrls.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {photoUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Review photo ${index + 1}`}
                className="h-24 w-24 object-cover rounded-lg"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
