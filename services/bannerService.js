import Banner from '../models/bannerModel.js';
import BaseService from '../utils/baseService.js';

class BannerService extends BaseService {
  constructor(Banner) {
    super(Banner);
  }
  
  async createBanner(data) {
    const banner = await this.create(data);
    return banner;
  }
  
  async updateBanner(id, data) {
    const banner = await this.update(id, data);
    return banner;
  }

}

export default new BannerService(Banner);
