/* //////////////////////////////////////////////////////////////////////// */
/* //////////////////////////////////////////////////////////////////////// */

const viewportHeight = 660; // rowHeight * 10 내가 보는 뷰포트 높이
const rowHeight = 56; // 리스트 행 하나의 높이 li의 높이 56
const rowMaxHeight = 74; // 리스트 토글시 높이
const nodePadding = 2; // 위아래에 추가로 같이 렌더링할 행 개수
const nodeCount = Math.ceil(viewportHeight / rowHeight); // 화면에 보이는 개수: 10
const visibleNodeCount = nodeCount + nodePadding * 2; // 실제 보여지는 개수: 14
const rowMap = {}; // 렌더링 된 요소를 저장할 변수

/* //////////////////////////////////////////////////////////////////////// */
/* //////////////////////////////////////////////////////////////////////// */

/**
 * @return {Promise<DataContent[]>} json 배열 리스트
 * json 배열 리스트 패칭
 */
async function getDatas() {
  const fetchMap = Array.from({ length: 10 }, (_, index) => `public/db/data${index}.json`);
  const fetchPromises = fetchMap.map((list) => fetch(list).then((res) => res.json()));
  const fetchDataArr = await Promise.all(fetchPromises);
  return fetchDataArr.flat();
}

const datas = await getDatas();

const dataSize = datas.length; // 데이터 개수: 10000
const totalRowHeight = rowHeight * dataSize; // 웹페이지의 크기: 560000
const totalRowMaxHeight = totalRowHeight + (rowMaxHeight * dataSize - totalRowHeight); // 웹 페이지 맥스 크기: 740000 - 웹 페이지 크기: 560000 = 180000

/**
 * @param {[number, number]} scrollTop
 * @return {[number, number]} [시작인덱스, 종료인덱스] 반환
 * 시작,종료 인덱스 계산
 */
function calculateOffsets(scrollTop) {
  const passNodeCount = Math.floor(scrollTop / rowHeight); // 지나온 노드의 개수
  const maxStartIndex = dataSize - visibleNodeCount; // startIndex의 최대값 10000 - 24 = 9986

  // 인덱스 계산
  const startIndex = passNodeCount - 1;
  // Math.min(Math.max(passNodeCount - nodePadding, 0), maxStartIndex); // 스크롤을 더 부드럽게 해주기 위해 (시작인덱스 - 내가 지나온 노드 개수) 해줍니다. 다만, 스크롤 렌더링 이슈가 있습니다.
  const endIndex = startIndex + visibleNodeCount;
  const offsets = [startIndex, endIndex];

  return offsets;
}

/**
 * @return () => void
 * 렌더링시 레이아웃 높이 값 지정
 */
function addStyle() {
  const layout = document.querySelector('.layout');
  layout.style.minHeight = `${totalRowHeight}px`;
  layout.style.maxHeight = `${totalRowMaxHeight}px`;
}

/* //////////////////////////////////////////////////////////////////////// */
/* //////////////////////////////////////////////////////////////////////// */

/**
 * @param {[number, number]} offsets
 * @return () => void
 * 스크롤에 따른 UI 렌더링
 */
async function render(offsets) {
  const [startIndex, endIndex] = offsets;

  // 상단 하단 여백 설정
  const virtualTopHeight = Math.max(startIndex * rowHeight, 0);
  const virtualBottomHeight = Math.max((dataSize - endIndex) * rowHeight, 0);
  const headPad = document.querySelector('.headPadding');
  const footPad = document.querySelector('.footPadding');

  if (virtualTopHeight === 0) {
    headPad.innerHTML = '';
  } else {
    headPad.innerHTML = `<div style="height:${virtualTopHeight}px"><p></p></div>`;
  }

  if (virtualBottomHeight === 0) {
    footPad.innerHTML = '';
  } else {
    footPad.innerHTML = `<div style="height:${virtualBottomHeight}px"><p></p></div>`;
  }

  // 데이터 리스트 렌더링
  datas.forEach((data, index) => {
    const { key, name, date } = data;

    const rowIndex = index + 1; // 배열 인덱스는 0부터 시작하기 때문에 1을 더해줍니다.
    const mapItem = rowMap[rowIndex]; // {}로 인덱스별로 UI를 저장합니다.

    if (startIndex < rowIndex && index < endIndex) {
      if (mapItem === undefined) {
        // UI가 없을때
        const nodeLi = document.createElement('li');
        nodeLi.ariaRowIndex = `${rowIndex}`;
        nodeLi.style.minHeight = `${rowHeight}px`;
        nodeLi.style.maxHeight = `${rowMaxHeight}px`;
        nodeLi.innerHTML = `<div class="collapse">
                          <article class="arrow">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <mask id="mask0_2363_30358" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">
                                  <rect width="16" height="16" transform="matrix(1 0 0 -1 0 16)" fill="#4169E1"/>
                                </mask>
                                <g mask="url(#mask0_2363_30358)">
                                  <path d="M10 8L6 5L6 11L10 8Z" fill="#4169E1" fill-opacity="1"/>
                                </g>
                              </svg>
                          </article>
                          <p>key: ${key}</p>
                          <p>username: ${name}</p>
                          <article class="delete">
                            <img src="public/images/icon/delete.svg" alt="delete" />
                          </article>
                        </div>
                        `;

        // 리스트 토글 기능 on/off
        nodeLi.children[0].firstElementChild.onclick = function () {
          const arrow = nodeLi.children[0].firstElementChild;
          const expanded = arrow.closest('.collapse').nextElementSibling;
          if (expanded.className.includes('on')) {
            expanded.classList.add('off');
            expanded.classList.remove('on');
            nodeLi.children[0].firstElementChild.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <mask id="mask0_2363_30358" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">
                                <rect width="16" height="16" transform="matrix(1 0 0 -1 0 16)" fill="#4169E1"/>
                              </mask>
                              <g mask="url(#mask0_2363_30358)">
                                <path d="M10 8L6 5L6 11L10 8Z" fill="#4169E1" fill-opacity="1"/>
                              </g>
                            </svg>`;
          } else {
            expanded.classList.add('on');
            expanded.classList.remove('off');
            nodeLi.children[0].firstElementChild.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <mask id="mask0_2363_30361" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">
                              <rect width="16" height="16" transform="matrix(-1 -8.74228e-08 -8.74228e-08 1 16 0)" fill="#4169E1"/>
                              </mask>
                              <g mask="url(#mask0_2363_30361)">
                              <path d="M8 10L11 6L5 6L8 10Z" fill="#4169E1" fill-opacity="1"/>
                              </g>
                            </svg>`;
          }
        };

        // 리스트 삭제 기능
        nodeLi.children[0].lastElementChild.onclick = function () {
          const deleteEl = nodeLi.children[0].lastElementChild;
          const parentEl = deleteEl.closest(`li[aria-rowindex="${rowIndex}"]`);
          parentEl.remove();
        };

        const listWrap = document.querySelector('.listWrap');
        const after = document.querySelector(`li[aria-rowindex="${rowIndex}"]`); // null일 경우 리스트의 맨 뒤에 추가해줌
        if (after !== null) {
          listWrap.insertBefore(nodeLi, after);
        } else {
          // 지나온 리스트를 검색하여 가장 최상단에 위치한 리스트 이전에 추가해줌
          // 없을 경우 맨 뒤 리스트에 nodeLi를 추가해줌
          const next = Array.from(listWrap.childNodes).find((row) => rowIndex < Number(row.ariaRowIndex));
          listWrap.insertBefore(nodeLi, next ?? null);
        }

        rowMap[rowIndex] = nodeLi; // UI 저장
      }
    } else if (mapItem) {
      // 보이지 않는 데이터인 경우
      mapItem.remove(); // DOM에 그려진 요소가 있다면 삭제
      delete rowMap[rowIndex]; // 맵에서 삭제
    }
  });
}

/* //////////////////////////////////////////////////////////////////////// */
/* //////////////////////////////////////////////////////////////////////// */

render(calculateOffsets(0)); // 초기 화면 렌더링
addStyle(); // 초기 레이아웃 높이 설정
document.querySelector('.container').addEventListener('scroll', (event) => render(calculateOffsets(event.currentTarget.scrollTop)));
