/* globals describe it */

import Server from '../server';
import Client from '../client-node';
import mongodb from 'maeva-mongodb';
import connect from '../connect';
import maeva, {Model} from 'maeva';
import should from 'should';

class Foo extends Model {
  static schema = {foo: Number};
}

const wsurl = 'ws://localhost:7766';
const mongodburl = 'mongodb://localhost:12345/test';

maeva.on('error', (error) => {
  console.log({error: error.stack});
});

maeva.on('warning', (error) => {
  console.log({warning: error.stack});
});

let server, client;

describe('Maeva Sockets', () => {
  describe('Server / Client', () => {
    it('should start server', () => {
      server = new Server(7766, [{
        name: 'mongodb',
        connect: mongodb,
      }]);
    });
    it('should start client and connect to server', async () => {
      client = new Client(wsurl);
      await new Promise((resolve) => {
        client.on('open', resolve);
      });
    });
  });

  describe('Auth', () => {
    it('should connect to server', async function () {
      this.timeout(5000);
      client.auth({
        driver: 'mongodb',
        url: mongodburl,
      });
      await new Promise((resolve) => {
        client.on('connected', resolve);
      });
    });
  });

  describe('Insert', () => {
    it('should insert', async function () {
      this.timeout(5000);
      client.insert('foos', {foo: 1});
    });
  });

  describe('Count', () => {
    it('should count', async function () {
      this.timeout(5000);
      client.count('foos');
    });
  });

  describe('Find', () => {
    it('should find', async function () {
      this.timeout(5000);
      client.find('foos', {foo: 1});
    });
  });

  describe('Update', () => {
    it('should update', async function () {
      this.timeout(5000);
      client.update('foos', {foo: 1}, {foo: 2});
    });
  });

  describe('Remove', () => {
    it('should remove', async function () {
      this.timeout(5000);
      client.remove('foos', {foo: 2});
    });
  });

  describe('Connect', () => {
    it('should connect', async function () {
      this.timeout(5000);
      maeva.connect(connect(
        Client,
        wsurl,
        {
          driver: 'mongodb',
          url: mongodburl,
        }
      ));
      await new Promise((resolve, reject) => {
        maeva.on('connected', resolve);
      });
    });
    it('should find', async function () {
      this.timeout(5000);
      const results = await Foo.find();
      console.log({results});
      should(results).be.an.Array();
      should(results.length).be.above(0);
    });
  });
});
