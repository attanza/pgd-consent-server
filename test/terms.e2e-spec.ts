import 'dotenv/config';
import mongoose from 'mongoose';
import { EUserRole } from '../src/shared/interfaces/user-role.enum';
import request from 'supertest';
import { UpdateTermDto } from '../src/term/term.dto';
import { Term, TermSchema } from '../src/term/term.schema';
import { User, UserSchema } from '../src/user/user.schema';
import {
  collectionExpects,
  createExpect,
  deleteExpect,
  duplicateErrorExpect,
  forbiddenExpect,
  showExpect,
  unauthorizedExpect,
  updateExpect,
  validationFailedExpect,
} from './expects';
import { APP_URL, faker, generateTokenByRole } from './helper';
import { Source, SourceSchema } from '../src/sources/source.schema';
const resource = 'Term';
const URL = '/terms';
let userModel: mongoose.Model<User>;
let termModel: mongoose.Model<Term>;
let sourceModel: mongoose.Model<Source>;

let adminToken;
let viewerToken;
let found;
let source: any;

const createData: UpdateTermDto = {
  title: faker.sentence(),
  content: faker.paragraph(),
  source: 'PDS',
};

beforeAll(async () => {
  const MONGOOSE_URI = process.env.DB_URL;
  await mongoose.connect(MONGOOSE_URI);
  userModel = mongoose.model('User', UserSchema);
  sourceModel = mongoose.model('Source', SourceSchema);
  source = await sourceModel.findOne();
  createData.source = source._id.toString();
  adminToken = await generateTokenByRole(userModel, EUserRole.ADMIN);
  viewerToken = await generateTokenByRole(userModel, EUserRole.VIEWER);
  termModel = mongoose.model('Term', TermSchema);
});
afterAll(async () => {
  await termModel.deleteOne({ title: createData.title });
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

describe(`${resource} Create`, () => {
  it('cannot create if not authenticated', () => {
    return request(APP_URL)
      .post(URL)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });

  it('cannot create if unauthorized', () => {
    return request(APP_URL)
      .post(URL)
      .set({ Authorization: `Bearer ${viewerToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpect(expect, body);
      });
  });

  it('cannot create if validation failed', () => {
    return request(APP_URL)
      .post(URL)
      .set({ Authorization: `Bearer ${adminToken}` })
      .expect(400)
      .expect(({ body }) => {
        const errMessage = `title should not be empty`;
        validationFailedExpect(expect, body, errMessage);
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
      });
  });

  it('cannot create if duplicate', () => {
    return request(APP_URL)
      .post(URL)
      .set({ Authorization: `Bearer ${adminToken}` })
      .send(createData)
      .expect(400)
      .expect(({ body }) => {
        duplicateErrorExpect(expect, body);
      });
  });
});
describe(`${resource} Detail`, () => {
  it('cannot get detail if not authenticated', async () => {
    found = await termModel.findOne({ title: createData.title });

    return request(APP_URL)
      .get(`${URL}/${found._id}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
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

  it('cannot update if unauthorized', () => {
    return request(APP_URL)
      .put(`${URL}/${found._id}`)
      .set({ Authorization: `Bearer ${viewerToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpect(expect, body);
      });
  });

  it('cannot update if invalid mongo id', () => {
    return request(APP_URL)
      .put(`${URL}/sfgdfg`)
      .set({ Authorization: `Bearer ${adminToken}` })
      .expect(400)
      .expect(({ body }) => {
        const errMessage = 'id must be a mongodb id';
        validationFailedExpect(expect, body, errMessage);
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
    updatedData.title = faker.sentence();

    return request(APP_URL)
      .put(`${URL}/${found._id}`)
      .set({ Authorization: `Bearer ${adminToken}` })
      .send(updatedData)
      .expect(200)
      .expect(({ body }) => {
        updateExpect(expect, body, resource);
        const output = { ...body };
        const dataToCheck = { ...createData };
        dataToCheck.title = updatedData.title;
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
