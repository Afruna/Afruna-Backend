import { ReviewInterface } from '@interfaces/Review.Interface';
import Review from '@models/Review';
import Repository from '@repositories/repository';

class ReviewRepository extends Repository<ReviewInterface> {
  protected model = Review;
}

export default ReviewRepository;
