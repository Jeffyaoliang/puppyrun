/**
 * 检查服务器是否运行
 */

const axios = require('axios');

const ports = [3000, 3001, 3002];

async function checkServer(port) {
  try {
    const response = await axios.get(`http://localhost:${port}/api/test`, {
      timeout: 2000
    });
    return { port, status: 'running', data: response.data };
  } catch (error) {
    return { port, status: 'not running', error: error.message };
  }
}

async function checkAllPorts() {
  console.log('正在检查服务器状态...\n');
  
  for (const port of ports) {
    const result = await checkServer(port);
    if (result.status === 'running') {
      console.log(`✓ 端口 ${port}: 服务器正在运行`);
      console.log(`  响应:`, JSON.stringify(result.data, null, 2));
      return port;
    } else {
      console.log(`✗ 端口 ${port}: 服务器未运行`);
    }
  }
  
  console.log('\n未找到运行中的服务器！');
  console.log('请确保服务器已启动: npm start');
  return null;
}

checkAllPorts().then(port => {
  if (port) {
    console.log(`\n使用端口 ${port} 进行测试`);
  }
});

