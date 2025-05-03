import { KYClogsInterface } from "@interfaces/KYClogs.Interface";
import Service from "./service";
import KycLogsRepository from "@repositories/KycLogs.repo";
import { KYCStatus } from "@interfaces/Vendor.Interface";
import VendorService from "./vendor.service";
import Category, { CategoryInterface } from '@models/Category';
import CategoryRepository from "../repositories/CategoryRepository";

class Category2Service extends Service<CategoryInterface, CategoryRepository> {
  private static _instance: Category2Service;
  protected repository = new CategoryRepository();
  vendorService = VendorService.instance()

  static instance() {
    if (!Category2Service._instance) {
        Category2Service._instance = new Category2Service();
    }
    return Category2Service._instance;
  }
};

export default Category2Service;
