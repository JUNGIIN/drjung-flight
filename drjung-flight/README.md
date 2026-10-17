# DR_Jung Flight

GitHub Pages URL: `https://drjun.github.io/drjung-flight/`

인천(ICN) 출발 일본 주요 도시의 Aviasales 가격달력을 표시하기 위한 정적 웹사이트입니다.

## GitHub Pages 배포

1. GitHub에서 `drjung-flight`라는 **Public repository**를 만듭니다.
2. 이 폴더의 파일을 저장소 최상위(root)에 업로드합니다.
3. 저장소 `Settings` → `Pages`로 이동합니다.
4. `Build and deployment` → `Source`에서 `Deploy from a branch`를 선택합니다.
5. Branch `main`, Folder `/(root)`를 선택하고 `Save`합니다.
6. 사이트 주소는 `https://drjun.github.io/drjung-flight/`가 됩니다.

## Travelpayouts 가입 전

`config.js`의 marker가 빈 값이어도 페이지는 정상 표시됩니다. 이 상태로 공개한 뒤 Travelpayouts Website Project URL로 아래 주소를 등록할 수 있습니다.

`https://drjun.github.io/drjung-flight/`

## Partner ID 발급 후

`config.js` 파일의 아래 부분을 수정합니다.

```js
marker: "",
```

예:

```js
marker: "1234567",
```

저장/커밋하면 GitHub Pages에 반영되고 Aviasales 가격달력이 표시됩니다.

> Partner ID(marker)는 위젯 소스에 포함되는 공개 식별자입니다. API token이나 비밀번호를 이 저장소에 넣지 마세요.

## Travelpayouts 소유권 확인

Travelpayouts가 사이트 소유 확인용 `<meta>` 태그를 제공하면 `index.html`의 `<head>` 안에 있는 주석 바로 아래에 붙여넣고 커밋하면 됩니다.
