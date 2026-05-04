async function testDb() {
  try {
    console.log('测试用户注册...');
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser_db',
        password: '123456',
        nickname: '数据库测试用户'
      })
    });
    const registerData = await registerResponse.json();
    console.log('注册结果:', JSON.stringify(registerData));
    
    if (registerData.code === 0) {
      console.log('\n测试用户登录...');
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser_db',
          password: '123456'
        })
      });
      const loginData = await loginResponse.json();
      console.log('登录结果:', JSON.stringify(loginData));
      
      if (loginData.data && loginData.data.token) {
        console.log('\n测试用户信息...');
        const profileResponse = await fetch('http://localhost:5000/api/user/profile', {
          headers: { 'Authorization': 'Bearer ' + loginData.data.token }
        });
        const profileData = await profileResponse.json();
        console.log('用户信息:', JSON.stringify(profileData));
      }
    }
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

setTimeout(testDb, 1000);
