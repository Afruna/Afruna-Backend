import { VAT_FEE } from "@config";
import { VendorType } from "@interfaces/Vendor.Interface";

export const computeDeliveryFee = async(reference: string = "") => {

    let fee = 0.00;

    return fee;
  };

  export const computeVAT = async(amount) => {

    let fee = (7.5 / 100) * amount;

    return fee;
  };


  export const stringToEnum = (value: string): VendorType | undefined  => {
    // Check if the string is a valid enum value
    if (Object.values(VendorType).includes(value as VendorType)) {
      return value as VendorType; // Convert string to enum
    }
    return undefined; // Return undefined if invalid
  };