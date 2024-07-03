//  브라우저 환경에선 commonjs 모듈을 사용 할 수 없다. 바벨이나 웹팩으로 컴파일을 해주어야 한다.

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000; // 사용할 port

// 정적 파일 제공
app.use(express.static(__dirname));

// 경로 설정에 따라 보여줄 view 파일 설정 가능
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 서버 연결
app.listen(PORT, () => {
  console.log(`서버 연결 성공`);
});
