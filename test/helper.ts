import { UserDocument } from '../src/user/user.schema';
import Chance from 'chance';
import jwt from 'jsonwebtoken';

export const faker = new Chance();
export const APP_URL = 'http://localhost:10000';
export const generateToken = async (user: UserDocument) => {
  const token = await jwt.sign({ uid: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  return token;
};
