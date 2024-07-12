const { Controller } = require('egg');
const mongo = require('../utils/db');

class ProjectController extends Controller {
  // 获取项目或组件的模板
  async getTemplate() {
    const { ctx } = this;
    const data = await mongo().query('Collections');
    ctx.body = data;
  }
}

module.exports = ProjectController;
