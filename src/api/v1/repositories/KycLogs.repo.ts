
import { KYClogsInterface } from '@interfaces/KYClogs.Interface';
import KYClogs from '@models/KYClogs';
import Repository from '@repositories/repository';

class KycLogsRepository extends Repository<KYClogsInterface> {
  protected model = KYClogs;
}

export default KycLogsRepository;
