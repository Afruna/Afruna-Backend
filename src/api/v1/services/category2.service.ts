import { KYClogsInterface } from "@interfaces/KYClogs.Interface";
import Service from "./service";
import KycLogsRepository from "@repositories/KycLogs.repo";
import { KYCStatus } from "@interfaces/Vendor.Interface";
import VendorService from "./vendor.service";
import Category, { CategoryInterface } from '@models/Category';
import CategoryRepository from "../repositories/CategoryRepository";
import HttpError from "@helpers/HttpError";
import Product from "@models/Product";


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

  // Fetch all parent categories (categories with no parent)
  async getAllParentCategories() {
    return this.repository.find({ parent: null });
  }

  // Fetch all subcategories for a given parent category
  async getSubcategories(parentCategoryId: string) {
    return this.repository.find({ parent: parentCategoryId });
  }

  // Add a subcategory to a parent category
  async addSubcategory(parentCategoryId: string, subcategoryData: Partial<CategoryInterface>) {
    // Create the subcategory with parent reference
    const subcategory = await this.repository.create({ ...subcategoryData, parent: parentCategoryId });
    // Optionally, update parent's children array (if you want to maintain it)
    await Category.findByIdAndUpdate(parentCategoryId, { $addToSet: { children: subcategory._id } });
    return subcategory;
  }

  // Get all products in nested categories
  async getAllProductsInNestedCategories(categoryId: string) {
    const category = await Category.findById(categoryId);
    if (!category) throw new HttpError('Category not found', 404);
    
    let products = [];
    let categories = await this.repository.find({ parent: categoryId });

    // Recursively collect products from all child categories
    for (const childCategory of categories) {
      const childCategoryProducts = await Product.find({ categoryId: childCategory._id });
      products = [...products, ...childCategoryProducts];
    }

    return products;
  }
};

export default Category2Service;
