const { MongoClient } = require('mongodb');

class Mongo {
  constructor(url, dbName) {
    this.url = url;
    this.dbName = dbName;
  }

  /**
   * 连接到 MongoDB 数据库
   * @return {Promise} 一个 Promise，当连接成功时，解析为包含 db 和 client 属性的对象
   */
  connect() {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.url, {
        serverApi: {
          version: '1',
          strict: true,
          deprecationErrors: true,
        },
      })
        .then(client => {
          console.log('连接 MongoDB 成功');
          const db = client.db(this.dbName);
          resolve({ db, client });
        })
        .catch(err => {
          console.log('连接 MongoDB 失败');
          reject(err);
        });
    });
  }

  /**
   * ConnectAction 到指定集合并执行传入函数
   * @param {string} docName - 要操作的集合名称
   * @param {function} action - 要执行的操作，接受两个回调，用于传递结果和错误
   * @return {Promise} 一个 Promise 对象，表示操作的结果
   */
  connectAction(docName, action) {
    return new Promise(async (resolve, reject) => {
      const { db, client } = await this.connect();
      try {
        const collection = db.collection(docName);
        action(
          collection,
          result => {
            this.close(client);
            resolve(result);
          },
          err => {
            this.close(client);
            reject(err);
          }
        );
      } catch (err) {
        this.close(client);
        reject(err);
      }
    });
  }

  /**
   * 查询指定集合中的所有文档，并返回一个 Promise
   * @param {string} docName - 要查询的集合名称
   * @return {Promise} 一个 Promise，当查询成功时，解析为包含查询结果的数组；当查询失败时，拒绝并返回错误
   */
  query(docName) {
    return this.connectAction(docName, (collection, onSuccess, onError) => {
      collection
        .find({})
        .toArray()
        .then(docs => {
          onSuccess(docs);
        })
        .catch(err => {
          onError(err);
        });
    });
  }

  /**
   * 向集合插入多条文档
   * @param {string} docName - 要插入文档的集合名称
   * @param {Array} data - 要插入的文档数据数组
   * @return {Promise} - 一个 Promise，当插入成功时，解析为插入操作结果
   */
  insert(docName, data) {
    return this.connectAction(docName, (collection, onSuccess, onError) => {
      collection.insertMany(data).then(result => {
        onSuccess(result);
      }).catch(err => {
        onError(err);
      });
    });
  }

  /**
   * 从数据库中删除指定文档
   * @param {string} docName - 要删除的文档名称（用作集合名称）
   * @param {object} data - 包含删除条件的对象
   * @return {Promise} 一个 Promise，如果删除成功，则解析为包含删除结果的对象，否则解析为错误对象
   */
  remove(docName, data) {
    return this.connectAction(docName, (collection, onSuccess, onError) => {
      collection.deleteOne(data).then(result => {
        onSuccess(result);
      }).catch(err => {
        onError(err);
      });
    });
  }

  /**
   * 更新指定文档中的数据
   * @param {string} docName - 要更新的文档名称
   * @param {object} config - 更新配置对象，包含搜索条件（searchData）和更新的数据（updateData）
   * @return {Promise} - 一个 Promise，当初始更新操作完成时解决，或者在遇到错误时拒绝
   */
  update(docName, config) {
    const { searchData = {}, updateData } = config;
    return this.connectAction(docName, (collection, onSuccess, onError) => {
      collection.updateMany(searchData, {
        $set: updateData,
      }).then(result => {
        onSuccess(result);
      }).catch(err => {
        onError(err);
      });
    });
  }

  /**
   * 关闭提供的客户端连接
   * 如果客户端对象存在，该方法将调用其 close() 方法来关闭连接
   * @param {MongoClient} client - 要关闭的 MongoClient 对象
   */
  close(client) {
    console.log('关闭连接');
    client && client.close();
  }
}

module.exports = Mongo;
