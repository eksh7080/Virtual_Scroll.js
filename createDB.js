const fs = require('fs');
const path = require('path');

// JSON 객체 생성
function createJSONObject(key, name, date) {
  return {
    key: key,
    name: name,
    date: date,
  };
}

// 1000개의 JSON 객체를 생성하여 각 파일에 저장
for (let i = 0; i < 10; i++) {
  let dataArr = [];
  for (let j = 0; j < 1000; j++) {
    let key = Math.floor(Math.random() * 1000) + 1; // 무작위 숫자 생성 (1에서 1000 사이)
    let name = `Person ${i * 1000 + j + 1}`;
    let date = new Date(`2024-01-01`);
    date.setDate(date.getDate() + i * 1000 + j); // 날짜 증가

    let jsonObject = createJSONObject(key, name, date.toISOString().split('T')[0]); // ISO 포맷에서 날짜만 추출
    dataArr.push(jsonObject);
  }

  // JSON 파일로 저장
  let filename = `data${i}.json`;
  let filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(dataArr, null, 2));

  console.log(`File ${filename} saved with 1000 entries.`);
}
