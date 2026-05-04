async function testApi() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser3',
        password: '123456',
        nickname: '测试用户3'
      })
    });
    
    const data = await response.json();
    console.log('注册结果:', JSON.stringify(data, null, 2));
    
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser3',
        password: '123456'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('登录结果:', JSON.stringify(loginData, null, 2));
    
    if (loginData.data && loginData.data.token) {
      const profileResponse = await fetch('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': 'Bearer ' + loginData.data.token
        }
      });
      const profileData = await profileResponse.json();
      console.log('用户信息:', JSON.stringify(profileData, null, 2));
    }
    
    const screenResponse = await fetch('http://localhost:5000/api/screen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        answers: [
          { question_id: 1, answer: 2 },
          { question_id: 2, answer: 2 },
          { question_id: 3, answer: 2 },
          { question_id: 4, answer: 2 },
          { question_id: 5, answer: 2 },
          { question_id: 6, answer: 2 },
          { question_id: 7, answer: 2 },
          { question_id: 8, answer: 2 },
          { question_id: 9, answer: 2 },
          { question_id: 10, answer: 2 },
          { question_id: 11, answer: 2 },
          { question_id: 12, answer: 2 },
          { question_id: 13, answer: 2 },
          { question_id: 14, answer: 2 },
          { question_id: 15, answer: 2 }
        ]
      })
    });
    const screenData = await screenResponse.json();
    console.log('筛查结果:', JSON.stringify(screenData, null, 2));
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testApi();
