import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { omit, pick } from 'lodash';
import { EditUserDto } from 'src/user/dto';

const PORT = 3333;

describe('App (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
    await app.listen(PORT);

    prisma = app.get(PrismaService);
    await prisma.cleanDatabase();
    pactum.request.setBaseUrl(`http://localhost:${PORT}`);
  });

  afterAll(() => {
    app.close();
  });

  it.todo('running');

  describe('Auth', () => {
    const validAuthCreds: AuthDto = {
      email: 'misha@asd.asd',
      password: 'test_test',
    };
    const invalidAuthCredsLogin: AuthDto = {
      email: 'misha@asd',
      password: 'test_test',
    };
    const invalidAuthCredsPass: AuthDto = {
      email: 'misha@asd.asd',
      password: 'test_test1',
    };
    describe('sign up', () => {
      it('create user', () => {
        return pactum
          .spec()
          .post('/auth/sign_up')
          .withBody(validAuthCreds)
          .expectStatus(201);
      });

      it('create user with same creds', () => {
        return pactum
          .spec()
          .post('/auth/sign_up')
          .withBody(validAuthCreds)
          .expectStatus(403);
      });

      it('create user with invalid creds', () => {
        return pactum
          .spec()
          .post('/auth/sign_up')
          .withBody(invalidAuthCredsLogin)
          .expectStatus(400);
      });

      it('create user without email', () => {
        return pactum
          .spec()
          .post('/auth/sign_up')
          .withBody(omit(validAuthCreds, ['email']))
          .expectStatus(400);
      });

      it('create user without password', () => {
        return pactum
          .spec()
          .post('/auth/sign_up')
          .withBody(omit(validAuthCreds, ['password']))
          .expectStatus(400);
      });
      it('create user without payload', () => {
        return pactum
          .spec()
          .post('/auth/sign_up')
          .withBody({})
          .expectStatus(400);
      });
    });

    describe('sign in', () => {
      it('login with wrond email', () => {
        return pactum
          .spec()
          .post('/auth/sign_in')
          .withBody(invalidAuthCredsLogin)
          .expectStatus(400);
      });

      it('login with wrong password', () => {
        return pactum
          .spec()
          .post('/auth/sign_in')
          .withBody(invalidAuthCredsPass)
          .expectStatus(400);
      });

      it('login without payload', () => {
        return pactum
          .spec()
          .post('/auth/sign_in')
          .withBody({})
          .expectStatus(400);
      });

      it('login with valid credentials', () => {
        return pactum
          .spec()
          .post('/auth/sign_in')
          .withBody(validAuthCreds)
          .expectStatus(200);
      });

      it('login and store access_token', () => {
        return pactum
          .spec()
          .post('/auth/sign_in')
          .withBody(validAuthCreds)
          .expectStatus(200)
          .stores('token', 'access_token');
      });
    });
  });
  describe('Users', () => {
    const validAuthCreds: EditUserDto = {
      email: 'misha@asd.asd',
    };

    const editData: EditUserDto = {
      email: 'misha@asd.asd',
      firstName: 'Mish',
      lastName: 'nonnono',
    };
    describe('get', () => {
      it('get user info without token', () => {
        return pactum.spec().get('/users/me').expectStatus(401);
      });

      it('get user info without token', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .expectStatus(200)
          .expectBodyContains(validAuthCreds.email);
      });
    });
    describe('edit', () => {
      it('assign firstName to user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .withBody(pick(editData, ['firstName']))
          .expectStatus(200);
      });

      it('assign lastName to user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .withBody(pick(editData, ['lastName']))
          .expectStatus(200);
      });
      it('assign empty email to user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .withBody({
            email: '',
          })
          .expectStatus(400);
      });

      it('assign invalid email to user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .withBody({
            email: 'a@a',
          })
          .expectStatus(400);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('get all', () => {});
    describe('create', () => {});
    describe('get by id', () => {});
    describe('edit', () => {});
    describe('delete', () => {});
  });
});
