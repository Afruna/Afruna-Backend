import { UserInterface } from '@interfaces/User.Interface';
import { customAlphabet } from 'nanoid';
import * as Config from '@config';
import jwt from 'jsonwebtoken';

// Load Chance
var Chance = require('chance');
// Instantiate Chance so it can be used
var chance = new Chance();


export const generateOrderNumber = (state: string, min: number = 1000001, max: number = 9999999) => {
    return chance.integer({ min: min, max: max }) + "-" + state.slice(0, 2)
};

export const generateDepositNumber = (min: number = 1000001, max: number = 9999999) => {
  return chance.integer({ min: min, max: max })
};

function generateRandomNumber(length?: number) {
  const nanoid = customAlphabet('1234567890', 11);
  const ref = nanoid(length);
  return `${ref}`;
}

export default () => {
  return generateRandomNumber(6);
};

export function getSignedToken(user: DocType<UserInterface>) {
  return jwt.sign({ id: user._id }, Config.JWT_KEY, { expiresIn: Config.JWT_TIMEOUT });
}