import { CategoryInterface } from "@models/Category";
import Controller from "./controller";
import Category2Service from "@services/category2.service";

class Category2Controller extends Controller<CategoryInterface> {
  service = new Category2Service();
  responseDTO = undefined; 

}

export default Category2Controller;