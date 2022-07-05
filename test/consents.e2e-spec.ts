import 'dotenv/config';
import mongoose from 'mongoose';
import { Source, SourceSchema } from '../src/sources/source.schema';
import request from 'supertest';
import { UpdateConsentDto } from '../src/consent/consent.dto';
import { Consent, ConsentSchema } from '../src/consent/consent.schema';
import { EUserRole } from '../src/shared/interfaces/user-role.enum';
import { User, UserSchema } from '../src/user/user.schema';
import {
  collectionExpects,
  createExpect,
  deleteExpect,
  forbiddenExpect,
  showExpect,
  unauthorizedExpect,
  unprocessableEntityExpect,
  updateExpect,
  validationFailedExpect,
} from './expects';
import { APP_URL, faker, generateTokenByRole } from './helper';
const resource = 'Consent';
const URL = '/consents';
let userModel: mongoose.Model<User>;
let consentModel: mongoose.Model<Consent>;
let sourceModel: mongoose.Model<Source>;

let adminToken;
let viewerToken;
let found;
let source: any;
let id = '';

const createData: UpdateConsentDto = {
  name: faker.name(),
  email: faker.email(),
  source: '',
};

beforeAll(async () => {
  const MONGOOSE_URI = process.env.DB_URL;
  await mongoose.connect(MONGOOSE_URI);
  userModel = mongoose.model('User', UserSchema);
  sourceModel = mongoose.model('Source', SourceSchema);
  source = await sourceModel.findOne().exec();
  createData.source = source._id.toString();
  adminToken = await generateTokenByRole(userModel, EUserRole.ADMIN);
  viewerToken = await generateTokenByRole(userModel, EUserRole.VIEWER);
  consentModel = mongoose.model('Consent', ConsentSchema);
});
afterAll(async () => {
  await consentModel.deleteOne({ nik: createData.nik });
  await mongoose.disconnect();
});
describe(`${resource} List`, () => {
  it('cannot get list if unauthorized', () => {
    return request(APP_URL)
      .get(URL)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });
  it('can get list', () => {
    return request(APP_URL)
      .get(URL)
      .set({ Authorization: `Bearer ${adminToken}` })
      .expect(200)
      .expect(({ body }) => {
        collectionExpects(expect, body, resource);
      });
  });
});

describe(`${resource} validations`, () => {
  it('will reject if all keys are empty', () => {
    const postData = {
      source: source._id.toString(),
    };
    return request(APP_URL)
      .post(URL)
      .set({ Authorization: `Bearer ${adminToken}` })
      .send(postData)
      .expect(422)
      .expect(({ body }) => {
        const errMessage = `one of fields [nik, phone, email, cif] should exists`;
        unprocessableEntityExpect(expect, body, errMessage);
      });
  });
});

describe(`${resource} Create`, () => {
  it('cannot create if not authenticated', () => {
    return request(APP_URL)
      .post(URL)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });

  it('can create', () => {
    return request(APP_URL)
      .post(URL)
      .set({ Authorization: `Bearer ${adminToken}` })
      .send(createData)
      .expect(201)
      .expect(({ body }) => {
        createExpect(expect, body, resource);
        const output = { ...body };
        const dataToCheck = { ...createData };
        Object.keys(dataToCheck).map((key) => {
          expect(output.data[key]).toEqual(dataToCheck[key]);
        });
        id = body.data._id;
      });
  });
  it('will update on second create', () => {
    const secondCreate = { ...createData, nik: faker.bb_pin() };
    return request(APP_URL)
      .post(URL)
      .set({ Authorization: `Bearer ${adminToken}` })
      .send(secondCreate)
      .expect(201)
      .expect(({ body }) => {
        createExpect(expect, body, resource);
        const output = { ...body };
        const dataToCheck = { ...secondCreate };
        Object.keys(dataToCheck).map((key) => {
          expect(output.data[key]).toEqual(dataToCheck[key]);
        });
        expect(id).toEqual(body.data._id);
      });
  });
  it('will update on third create', () => {
    const thirdCreate = { ...createData, phone: faker.phone() };
    return request(APP_URL)
      .post(URL)
      .set({ Authorization: `Bearer ${adminToken}` })
      .send(thirdCreate)
      .expect(201)
      .expect(({ body }) => {
        createExpect(expect, body, resource);
        const output = { ...body };
        const dataToCheck = { ...thirdCreate };
        Object.keys(dataToCheck).map((key) => {
          expect(output.data[key]).toEqual(dataToCheck[key]);
        });
        expect(id).toEqual(body.data._id);
      });
  });
});
describe(`${resource} Detail`, () => {
  it('cannot get detail if not authenticated', async () => {
    found = await consentModel.findOne({ email: createData.email });

    return request(APP_URL)
      .get(`${URL}/${found._id}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });
  it('cannot get detail if not exists', () => {
    return request(APP_URL)
      .get(`${URL}/62b9b69c41819e19ac9aa580`)
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
      .get(`${URL}/${found._id}`)
      .set({ Authorization: `Bearer ${adminToken}` })
      .expect(200)
      .expect(({ body }) => {
        showExpect(expect, body, resource);
        const output = { ...body };
        const dataToCheck = {
          ...createData,
          source: { _id: source._id.toString(), name: source.name },
        };
        Object.keys(dataToCheck).map((key) => {
          expect(output.data[key]).toEqual(dataToCheck[key]);
        });
      });
  });
  it('can get detail by nik', () => {
    return request(APP_URL)
      .get(`${URL}/${found.nik}`)
      .set({ Authorization: `Bearer ${adminToken}` })
      .expect(200)
      .expect(({ body }) => {
        showExpect(expect, body, resource);
        const output = { ...body };
        const dataToCheck = { ...createData };
        Object.keys(dataToCheck).map((key) => {
          expect(output.data[key]).toEqual(dataToCheck[key]);
        });
      });
  });
  it('can get detail by phone', () => {
    return request(APP_URL)
      .get(`${URL}/${found.phone}`)
      .set({ Authorization: `Bearer ${adminToken}` })
      .expect(200)
      .expect(({ body }) => {
        showExpect(expect, body, resource);
        const output = { ...body };
        const dataToCheck = { ...createData };
        Object.keys(dataToCheck).map((key) => {
          expect(output.data[key]).toEqual(dataToCheck[key]);
        });
      });
  });
  it('can get detail by email', () => {
    return request(APP_URL)
      .get(`${URL}/${found.email}`)
      .set({ Authorization: `Bearer ${adminToken}` })
      .expect(200)
      .expect(({ body }) => {
        showExpect(expect, body, resource);
        const output = { ...body };
        const dataToCheck = { ...createData };
        Object.keys(dataToCheck).map((key) => {
          expect(output.data[key]).toEqual(dataToCheck[key]);
        });
      });
  });
});
describe(`${resource} Update`, () => {
  it('cannot update if not authenticated', () => {
    return request(APP_URL)
      .put(`${URL}/${found._id}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });
  it('cannot update if not exists', () => {
    return request(APP_URL)
      .put(`${URL}/5f091216ae2a140e064d2326`)
      .set({ Authorization: `Bearer ${adminToken}` })
      .expect(400)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toEqual(`${resource} not found`);
      });
  });
  it('can update', async () => {
    const updatedData = { ...createData };
    updatedData.name = faker.name();

    return request(APP_URL)
      .put(`${URL}/${found._id}`)
      .set({ Authorization: `Bearer ${adminToken}` })
      .send(updatedData)
      .expect(200)
      .expect(({ body }) => {
        updateExpect(expect, body, resource);
        const output = { ...body };
        const dataToCheck = { ...createData };
        dataToCheck.name = updatedData.name;
        Object.keys(dataToCheck).map((key) => {
          expect(output.data[key]).toEqual(dataToCheck[key]);
        });
      });
  });
});

describe(`${resource} Delete`, () => {
  it('cannot delete if not authenticated', () => {
    return request(APP_URL)
      .delete(`${URL}/${found._id}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });

  it('cannot delete if unauthorized', () => {
    return request(APP_URL)
      .delete(`${URL}/${found._id}`)
      .set({ Authorization: `Bearer ${viewerToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpect(expect, body);
      });
  });

  it('cannot delete if invalid mongo id', () => {
    return request(APP_URL)
      .delete(`${URL}/sfgdfg`)
      .set({ Authorization: `Bearer ${adminToken}` })
      .expect(400)
      .expect(({ body }) => {
        const errMessage = 'id must be a mongodb id';
        validationFailedExpect(expect, body, errMessage);
      });
  });
  it('cannot delete if not exists', () => {
    return request(APP_URL)
      .delete(`${URL}/5f091216ae2a140e064d2326`)
      .set({ Authorization: `Bearer ${adminToken}` })
      .expect(400)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toEqual(`${resource} not found`);
      });
  });
  it('can delete', async () => {
    return request(APP_URL)
      .delete(`${URL}/${found._id}`)
      .set({ Authorization: `Bearer ${adminToken}` })
      .expect(200)
      .expect(({ body }) => {
        deleteExpect(expect, body, resource);
      });
  });
});
