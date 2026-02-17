import { CategoryInterface } from "@models/Category";
import Controller from "./controller";
import Category2Service from "@services/category2.service";
import { Request } from "express";

class Category2Controller extends Controller<CategoryInterface> {
  service = new Category2Service();
  responseDTO = undefined; 

  // Get all parent categories
  getParentCategories = this.control(async (req: Request) => {
    return await this.service.getAllParentCategories();
  });

  // Get subcategories for a parent
  getSubcategories = this.control(async (req: Request) => {
    const parentCategoryId = req.params.categoryId;
    return await this.service.getSubcategories(parentCategoryId);
  });

  // Add a subcategory
  addSubcategory = this.control(async (req: Request) => {
    const parentCategoryId = req.params.categoryId;
    const subcategoryData = req.body;
    return await this.service.addSubcategory(parentCategoryId, subcategoryData);
  });
}

export default Category2Controller;