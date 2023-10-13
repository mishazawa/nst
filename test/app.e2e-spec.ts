import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { omit, pick } from 'lodash';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, UpdateBookmarkDto } from 'src/bookmark/dto';

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

    const secondUserCreds: AuthDto = {
      email: 'misha222@asd.asd',
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
      it('create second user', () => {
        return pactum
          .spec()
          .post('/auth/sign_up')
          .withBody(secondUserCreds)
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

      it('login and store access_token for second user', () => {
        return pactum
          .spec()
          .post('/auth/sign_in')
          .withBody(secondUserCreds)
          .expectStatus(200)
          .stores('token_user2', 'access_token');
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
    const bookmarkGoogle: CreateBookmarkDto = {
      title: 'google',
      link: 'https://google.com',
    };

    const bookmarkGmail: CreateBookmarkDto = {
      title: 'gmail',
      link: 'https://gmail.com',
    };

    const bookmarkYoutube: UpdateBookmarkDto = {
      title: 'youtube',
      link: 'https://youtube.com',
    };

    describe('create', () => {
      it('creates google bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .withBody(bookmarkGoogle)
          .expectStatus(201)
          .stores('bookmark_id', 'id');
      });

      it('fail to create bookmark without link', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .withBody(omit(bookmarkGoogle, ['link']))
          .expectStatus(400);
      });
    });

    describe('get by id', () => {
      it("get bookmark that doesn't exist", () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '-1')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .expectStatus(404);
      });
      it('get bookmark that does exist', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmark_id}')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .expectStatus(200)
          .expectBodyContains('google');
      });
    });

    describe('edit', () => {
      it("change bookmark that doesn't exist", () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '-1')

          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .withBody(bookmarkGmail)
          .expectStatus(404);
      });

      it("change bookmark that doesn't belong to user", () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmark_id}')
          .withHeaders({
            Authorization: `Bearer $S{token_user2}`,
          })
          .withBody(bookmarkYoutube)
          .expectStatus(404);
      });

      it('change google bookmark to gmail', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmark_id}')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .withBody(bookmarkGmail)
          .expectStatus(200)
          .expectBodyContains('gmail');
      });

      it('change gmail bookmark title to youtube', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmark_id}')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .withBody(omit(bookmarkYoutube, ['link']))
          .expectStatus(200)
          .expectBodyContains('gmail')
          .expectBodyContains('youtube');
      });
    });

    describe('get list of user bookmarks', () => {
      it('get list authorized', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
      it('get list unauthorized', () => {
        return pactum.spec().get('/bookmarks').expectStatus(401);
      });
    });

    describe('delete', () => {
      it("bookmark doesn't exist", () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '-1')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .expectStatus(404);
      });
      it('bookmark does exist', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmark_id}')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .expectStatus(204);
      });
    });
  });
});
