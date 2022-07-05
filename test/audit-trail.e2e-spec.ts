import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import { EUserRole } from '../src/shared/interfaces/user-role.enum';
import { User, UserSchema } from '../src/user/user.schema';
import {
  collectionExpects,
  forbiddenExpect,
  showExpect,
  unauthorizedExpect,
  validationFailedExpect,
} from './expects';
import { APP_URL, generateTokenByRole } from './helper';
const resource = 'AuditTrail';
const URL = '/audit-trails';
let userModel: mongoose.Model<User>;
let adminToken;
let viewerToken;
let found;
let auditTrailId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.DB_URL);
  userModel = mongoose.model('User', UserSchema);
  adminToken = await generateTokenByRole(userModel, EUserRole.ADMIN);
  viewerToken = await generateTokenByRole(userModel, EUserRole.VIEWER);
});
afterAll(async () => {
  await mongoose.disconnect();
});
describe(`${resource} List`, () => {
  it('cannot get list if unauthenticated', () => {
    return request(APP_URL)
      .get(URL)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });
  it('cannot get list if unauthorized', () => {
    return request(APP_URL)
      .get(URL)
      .set({ Authorization: `Bearer ${viewerToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpect(expect, body);
      });
  });
  it('can get list', () => {
    return request(APP_URL)
      .get(URL)
      .set({ Authorization: `Bearer ${adminToken}` })
      .expect(200)
      .expect(({ body }) => {
        collectionExpects(expect, body, resource);
        auditTrailId = body.data[0]._id;
      });
  });
});

describe(`${resource} Detail`, () => {
  it('cannot get detail if not authenticated', async () => {
    return request(APP_URL)
      .get(`${URL}/${auditTrailId}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });
  it('cannot get detail list if unauthorized', () => {
    return request(APP_URL)
      .get(`${URL}/${auditTrailId}`)
      .set({ Authorization: `Bearer ${viewerToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpect(expect, body);
      });
  });

  it('cannot get detail if invalid mongo id', () => {
    return request(APP_URL)
      .get(`${URL}/sfgdfg`)
      .set({ Authorization: `Bearer ${adminToken}` })
      .expect(400)
      .expect(({ body }) => {
        const errMessage = 'id must be a mongodb id';
        validationFailedExpect(expect, body, errMessage);
      });
  });
  it('cannot get detail if not exists', () => {
    return request(APP_URL)
      .get(`${URL}/62b9b69c41819e19ac9aa569`)
      .set({ Authorization: `Bearer ${adminToken}` })
      .expect(400)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toEqual(`${resource} not found`);
      });
  });
  it('can get detail', () => {
    return request(APP_URL)
      .get(`${URL}/${auditTrailId}`)
      .set({ Authorization: `Bearer ${adminToken}` })
      .expect(200)
      .expect(({ body }) => {
        showExpect(expect, body, resource);
      });
  });
});
