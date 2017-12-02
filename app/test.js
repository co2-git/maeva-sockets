/* globals describe before it */
import WS from 'ws';
import * as data from 'maeva';
import mongodb from 'maeva-mongodb';
import should from 'should';
import 'babel-polyfill';

import sockets, {Server} from '..';

global.WebSocket = WS;

const model = data.model('foo', {score: Number});

let conn;

describe('Maeva Sockets', () => {
  before(async () => {
    await new Promise((resolve, reject) => {
      try {
        const server = new Server({
          connector: () => data.connect(
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
      conn = data.connect(connector);
    });
  });
  describe('Insert', () => {
    describe('Insert One', () => {
      let inserted;
      it('should insert one', () => new Promise(async (resolve, reject) => {
        try {
          inserted = await data.insertOne(
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
          found = await data.findOne(
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
    describe('Find One with link', () => {
      let found;
      let team;
      it('should find one', () => new Promise(async (resolve, reject) => {
        try {
          const teamModel = data.model('teams', {name: String});
          team = await data.insertOne(
            teamModel,
            {name: 'Barca'},
            {connection: conn}
          );
          const playerModel = data.model(
            'players',
            {name: String, team: data.link(teamModel)}
          );
          await data.insertOne(
            playerModel,
            {team, name: 'Messi'},
            {connection: conn}
          );
          found = await data.findOne(
            playerModel,
            {team},
            {connection: conn}
          );
          resolve();
        } catch (error) {
          reject(error);
        }
      }));
      it('should be the correct document', () => {
        should(found.name).eql('Messi');
        should(found.team).eql(team._id);
      });
    });
    describe('Find many', () => {
      let found;
      it('should find many', () => new Promise(async (resolve, reject) => {
        try {
          found = await data.findMany(
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
    describe('Find by id', () => {
      let inserted;
      let found;
      it('should insert one', async () => {
        inserted = await data.insertOne(model, {score: 0}, {connection: conn});
      });
      it('should find by id', async () => {
        found = await data.findById(model, inserted, {connection: conn});
      });
      it('should be the right id', () => {
        should(data.getDocumentId(found, conn))
          .eql(data.getDocumentId(inserted, conn));
      });
    });
  });
  describe('Update', () => {
    describe('Update by id', () => {
      let inserted;
      it('should insert', () => new Promise(async (resolve, reject) => {
        try {
          inserted = await data.insertOne(
            model,
            {score: 999},
            {connection: conn}
          );
          resolve();
        } catch (error) {
          reject(error);
        }
      }));
      it('should update', () => new Promise(async (resolve, reject) => {
        try {
          const updated = await data.updateById(
            model,
            inserted,
            {score: 997},
            {connection: conn}
          );
          should(updated.score).eql(997);
          should(updated._id).eql(inserted._id);
          resolve();
        } catch (error) {
          reject(error);
        }
      }));
    });
  });
});
