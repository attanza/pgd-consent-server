import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import { UpdateConsentDto } from '../src/consent/consent.dto';
import { Consent, ConsentSchema } from '../src/consent/consent.schema';
import { User, UserSchema } from '../src/user/user.schema';
import {
  collectionExpects,
  createExpect,
  deleteExpect,
  showExpect,
  unauthorizedExpect,
  unprocessableEntityExpect,
  updateExpect,
  validationFailedExpect,
} from './expects';
import { APP_URL, faker, generateToken } from './helper';
const resource = 'Consent';
const URL = '/consents';
let userModel: mongoose.Model<User>;
let consentModel: mongoose.Model<Consent>;
let token;
let found;

const createData: UpdateConsentDto = {
  name: faker.name(),
  nik: faker.bb_pin(),
  email: faker.email(),
  source: 'PDS',
};

beforeAll(async () => {
  const MONGOOSE_URI = process.env.DB_URL;
  await mongoose.connect(MONGOOSE_URI);
  userModel = mongoose.model('User', UserSchema);
  consentModel = mongoose.model('Consent', ConsentSchema);
  const user = await userModel.findOne();
  token = await generateToken(user);
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
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        collectionExpects(expect, body, resource);
      });
  });
});

describe(`${resource} validations`, () => {
  const postData = {
    source: 'PDS',
  };
  it.only('will reject if all keys are empty', () => {
    return request(APP_URL)
      .post(URL)
      .set({ Authorization: `Bearer ${token}` })
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
      .set({ Authorization: `Bearer ${token}` })
      .send(createData)
      .expect(201)
      .expect(({ body }) => {
        createExpect(expect, body, resource);
        const output = { ...body };
        const dataToCheck = { ...createData };
        Object.keys(dataToCheck).map((key) => {
          expect(output.data[key]).toEqual(dataToCheck[key]);
        });
      });
  });

  // it('cannot create if duplicate', () => {
  //   return request(APP_URL)
  //     .post(URL)
  //     .set({ Authorization: `Bearer ${token}` })
  //     .send(createData)
  //     .expect(400)
  //     .expect(({ body }) => {
  //       duplicateErrorExpect(expect, body);
  //     });
  // });
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

  // it('cannot get detail if invalid mongo id', () => {
  //   return request(APP_URL)
  //     .get(`${URL}/sfgdfg`)
  //     .set({ Authorization: `Bearer ${token}` })
  //     .expect(400)
  //     .expect(({ body }) => {
  //       console.log('body', body);
  //       const errMessage = 'id must be a mongodb id';
  //       validationFailedExpect(expect, body, errMessage);
  //     });
  // });
  it('cannot get detail if not exists', () => {
    return request(APP_URL)
      .get(`${URL}/62b9b69c41819e19ac9aa580`)
      .set({ Authorization: `Bearer ${token}` })
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
      .set({ Authorization: `Bearer ${token}` })
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

  // it('cannot update if invalid mongo id', () => {
  //   return request(APP_URL)
  //     .put(`${URL}/sfgdfg`)
  //     .set({ Authorization: `Bearer ${token}` })
  //     .expect(400)
  //     .expect(({ body }) => {
  //       const errMessage = 'id must be a mongodb id';
  //       validationFailedExpect(expect, body, errMessage);
  //     });
  // });
  it('cannot update if not exists', () => {
    return request(APP_URL)
      .put(`${URL}/5f091216ae2a140e064d2326`)
      .set({ Authorization: `Bearer ${token}` })
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
      .set({ Authorization: `Bearer ${token}` })
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

  it('cannot delete if invalid mongo id', () => {
    return request(APP_URL)
      .delete(`${URL}/sfgdfg`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .expect(({ body }) => {
        const errMessage = 'id must be a mongodb id';
        validationFailedExpect(expect, body, errMessage);
      });
  });
  it('cannot delete if not exists', () => {
    return request(APP_URL)
      .delete(`${URL}/5f091216ae2a140e064d2326`)
      .set({ Authorization: `Bearer ${token}` })
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
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        deleteExpect(expect, body, resource);
      });
  });
});
