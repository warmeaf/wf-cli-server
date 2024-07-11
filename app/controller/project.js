const { Controller } = require('egg');

class ProjectController extends Controller {
  // 获取项目或组件的模板
  async getTemplate() {
    const { ctx } = this;
    ctx.body = 'project index';
  }
}

module.exports = ProjectController;
