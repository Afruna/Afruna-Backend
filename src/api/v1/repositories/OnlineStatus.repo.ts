import OnlineStatus, { OnlineStatusInterface } from '@models/OnlineStatus';
import Repository from '@repositories/repository';

class OnlineStatusRepo extends Repository<OnlineStatusInterface> {
  protected model = OnlineStatus;

  
}

export default OnlineStatusRepo;
