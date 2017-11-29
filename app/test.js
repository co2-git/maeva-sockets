/* globals describe before it */
import WS from 'ws';
import * as maeva from 'maeva';
import mongodb from 'maeva-mongodb';
import should from 'should';

import sockets, {Server} from '..';

global.WebSocket = WS;

const model = maeva.model('foo', {score: Number});

let conn;

describe('Maeva Sockets', () => {
  before(async () => {
    await new Promise((resolve, reject) => {
      try {
        const server = new Server({
          connector: () => maeva.connect(
            mongodb('mongodb://localhost:7007/maeva-sockets')
          ),
          name: 'wallets-mongodb',
          port: 12345,
          debug: false,
        });
        resolve(server);
      } catch (error) {
        reject(error);
      }
    });
  });
  describe('Connect', () => {
    it('should connect', () => {
      const connector = sockets('ws://localhost:12345', {debug: false});
      conn = maeva.connect(connector);
    });
  });
  describe('Insert', () => {
    describe('Insert One', () => {
      let inserted;
      it('should insert one', () => new Promise(async (resolve, reject) => {
        try {
          inserted = await maeva.insertOne(
            model,
            {score: 0},
            {connection: conn}
          );
          resolve();
        } catch (error) {
          reject(error);
        }
      }));
      it('should be a valid document', () => {
        should(inserted.score).eql(0);
        should(inserted).have.property('_id').which.is.not.null();
      });
    });
  });
  describe('Find', () => {
    describe('Find One', () => {
      let found;
      it('should find one', () => new Promise(async (resolve, reject) => {
        try {
          found = await maeva.findOne(
            model,
            {score: 0},
            {connection: conn}
          );
          resolve();
        } catch (error) {
          reject(error);
        }
      }));
      it('should be the correct document', () => {
        should(found.score).eql(0);
        should(found).have.property('_id').which.is.not.null();
      });
    });
    describe('Find many', () => {
      let found;
      it('should find many', () => new Promise(async (resolve, reject) => {
        try {
          found = await maeva.findMany(
            model,
            {},
            {connection: conn}
          );
          resolve();
        } catch (error) {
          reject(error);
        }
      }));
      it('should be the correct documents', () => {
        should(found).be.an.Array();
      });
    });
  });
});
