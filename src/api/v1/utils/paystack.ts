import { PAYSTACK_BASE_URL, PAYSTACK_SECRET } from "@config";
import axios from "axios";

export const verifyPaystack = async(reference: string) => {

    let res = await axios({
        method: 'get',
        url: `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + PAYSTACK_SECRET
        }
    });

    console.log("Data", res.data.data);

    let responseData = res.data.data;

    return responseData;
  };


  export const listBanks = async() => {

    let res = await axios({
        method: 'get',
        url: `${PAYSTACK_BASE_URL}/bank`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + PAYSTACK_SECRET
        }
    });

    console.log("Data", res.data.data);

    let responseData = res.data.data;

    return responseData;
  };