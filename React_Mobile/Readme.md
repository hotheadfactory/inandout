# In&Out 규칙

1. 한가지 특정 기능을 중심으로 브핸치를 판다.
    1. 함수단위가 아닌 모듈단위
2. 사용 브랜치
    1. develop
    이 브랜치를 기준으로 기능 별로 브랜치를 나눈다.
3. git 
    1. git add .
    2. git commit -m ""
    3. git push origin **작업브랜치**
    4. 어떤 사람이 develope 에 풀리퀘스트가 머지 될경우
        git pull origin develop:
        언제든지 한다. 단 master branch에선 금지
    5. pull request 는  작업브랜치 => develope 으로 한다.
    6. issue는 commit -m "#[issue번호] ~~~~~"
4. commit convention
    > feat : 기능 구현
    > page : 페이지 추가 (react)
    > component : 컴포넌트 추가 (react)
    > docs : 문서 작업
    > modify : 코드 수정
    > style : 스타일 css
    > add : 파일 추가, html 추가

