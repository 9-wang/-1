async function testSimple() {
  try {
    const response = await fetch('http://localhost:5000/api/profile');
    const data = await response.json();
    console.log('Profile:', JSON.stringify(data, null, 2));
    
    const chatResponse = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '你好' })
    });
    const chatData = await chatResponse.json();
    console.log('Chat:', JSON.stringify(chatData, null, 2));
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testSimple();
