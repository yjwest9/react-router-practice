# React Router 게시글 프로젝트 코드 설명

이 문서는 프로젝트의 데이터 요청 구조와 각 파일의 역할을 복습하기 위한 문서입니다.

## 1. 전체 구조

현재 프로젝트는 `App`에서 모든 데이터를 한 번에 요청하지 않습니다. 실제 데이터가 필요한 페이지 컴포넌트가 직접 API를 호출하고 자신의 상태로 관리합니다.

```text
App
├── NavBar
├── HomePage (/)
│   ├── GET /posts
│   └── GET /users
└── CardDetailPage (/:id)
    ├── GET /posts/:id
    └── GET /posts/:id/comments
```

이 구조의 장점은 다음과 같습니다.

- `App`은 라우팅 역할에 집중합니다.
- 홈과 상세 페이지가 자신에게 필요한 데이터만 요청합니다.
- 상세 페이지에서 전체 게시글과 전체 댓글을 내려받지 않습니다.
- 페이지별 로딩 상태와 에러를 독립적으로 처리할 수 있습니다.

---

## 2. `src/App.jsx`

`App`은 URL에 맞는 페이지를 보여주는 역할만 담당합니다.

```jsx
function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:id" element={<CardDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 라우트 설명

- `/`: 게시글 목록인 `HomePage`를 보여줍니다.
- `/:id`: URL의 `id`에 해당하는 `CardDetailPage`를 보여줍니다.
- `/3`으로 접속하면 `id`는 문자열 `"3"`이 됩니다.

예전처럼 `App`에서 `posts`, `users`, `comments` 상태를 만들거나 자식에게 props로 전달하지 않습니다.

---

## 3. `src/http.js`

API 요청과 관련된 코드를 한곳에서 관리합니다.

### 공통 요청 함수

```js
const API_URL = "https://jsonplaceholder.typicode.com";

async function request(path, signal) {
  const response = await fetch(`${API_URL}${path}`, { signal });

  if (!response.ok) {
    throw new Error(`API 요청에 실패했습니다. (${response.status})`);
  }

  return response.json();
}
```

`request` 함수는 다음 순서로 동작합니다.

1. 기본 주소와 전달받은 API 경로를 합칩니다.
2. `fetch`로 HTTP 요청을 보냅니다.
3. 응답 상태가 실패이면 에러를 발생시킵니다.
4. 성공하면 JSON 데이터를 반환합니다.

`fetch`는 404나 500 응답을 받아도 자동으로 에러를 던지지 않기 때문에 `response.ok`를 직접 검사해야 합니다.

### 목록 페이지용 함수

```js
export function fetchGetPosts(signal) {
  return request("/posts", signal);
}

export function fetchGetUsers(signal) {
  return request("/users", signal);
}
```

- `fetchGetPosts`: 전체 게시글을 요청합니다.
- `fetchGetUsers`: 전체 작성자를 요청합니다.

### 상세 페이지용 함수

```js
export function fetchGetPost(postId, signal) {
  return request(`/posts/${postId}`, signal);
}

export function fetchGetPostComments(postId, signal) {
  return request(`/posts/${postId}/comments`, signal);
}
```

예를 들어 `postId`가 `5`라면 다음 주소를 요청합니다.

```text
/posts/5
/posts/5/comments
```

따라서 상세 페이지 하나를 보기 위해 전체 게시글 100개와 전체 댓글 500개를 받을 필요가 없습니다.

---

## 4. `src/components/HomePage.jsx`

홈 페이지는 게시글 목록과 작성자 정보를 직접 요청합니다.

### 상태

```jsx
const [posts, setPosts] = useState([]);
const [users, setUsers] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);
```

- `posts`: API에서 받은 게시글 배열
- `users`: API에서 받은 사용자 배열
- `isLoading`: 요청 진행 여부
- `error`: 요청 실패 시 보여줄 메시지

### 컴포넌트가 나타날 때 데이터 요청

```jsx
useEffect(() => {
  const controller = new AbortController();

  async function loadHomeData() {
    try {
      setIsLoading(true);
      setError(null);

      const [postData, userData] = await Promise.all([
        fetchGetPosts(controller.signal),
        fetchGetUsers(controller.signal),
      ]);

      setPosts(postData);
      setUsers(userData);
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        setError(requestError.message);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }

  loadHomeData();
  return () => controller.abort();
}, []);
```

빈 의존성 배열 `[]`을 사용했으므로 컴포넌트가 처음 화면에 나타날 때 실행됩니다.

### `Promise.all`

게시글 요청과 사용자 요청은 서로의 결과를 기다릴 필요가 없습니다.

```jsx
const [postData, userData] = await Promise.all([
  fetchGetPosts(controller.signal),
  fetchGetUsers(controller.signal),
]);
```

두 요청을 동시에 시작하기 때문에 순서대로 요청하는 것보다 전체 대기 시간을 줄일 수 있습니다. 단, 둘 중 하나라도 실패하면 `Promise.all` 전체가 실패하여 `catch`로 이동합니다.

### 게시글과 작성자 연결

```jsx
{posts.map((post) => {
  const user = users.find((item) => item.id === post.userId);
  return <ListCard key={post.id} post={post} user={user} />;
})}
```

각 게시글의 `userId`와 사용자의 `id`가 같은 항목을 `find`로 찾은 다음 `ListCard`에 전달합니다.

---

## 5. `src/components/ListCard.jsx`

`ListCard`는 부모에게 받은 게시글 하나와 사용자 하나를 화면에 표시합니다. 이 컴포넌트는 API를 직접 호출할 필요가 없습니다.

```jsx
function ListCard({ post, user }) {
  return (
    <Link to={`/${post.id}`} className="blog-card">
      {/* 게시글 내용 */}
    </Link>
  );
}
```

`post.id`가 `7`이면 링크 주소는 `/7`이 됩니다. 이 주소는 `App.jsx`의 `/:id` 라우트와 일치하므로 상세 페이지가 열립니다.

```jsx
<strong>{user?.username ?? "Unknown"}</strong>
```

- `user?.username`: `user`가 있을 때만 `username`에 접근합니다.
- `?? "Unknown"`: 사용자 정보가 없으면 `Unknown`을 표시합니다.

---

## 6. `src/components/CardDetailPage.jsx`

상세 페이지는 URL에 있는 게시글 번호를 읽고 해당 게시글과 댓글만 직접 요청합니다.

### URL 파라미터 읽기

```jsx
const { id } = useParams();
const postId = Number(id);
```

`useParams`로 받은 값은 문자열입니다. API 요청과 숫자 비교에 사용하기 위해 `Number`로 변환합니다.

### 상세 페이지 상태

```jsx
const [card, setCard] = useState(null);
const [comments, setComments] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);
```

게시글은 하나이므로 초기값이 `null`, 댓글은 여러 개이므로 초기값이 빈 배열입니다.

### 현재 게시글과 댓글 요청

```jsx
const [postData, commentData] = await Promise.all([
  fetchGetPost(postId, controller.signal),
  fetchGetPostComments(postId, controller.signal),
]);

setCard(postData);
setComments(commentData);
```

`/5` 페이지에서는 5번 게시글 하나와 5번 게시글의 댓글만 동시에 요청합니다.

### `useEffect` 의존성

```jsx
}, [postId]);
```

`/5`에서 다음 글 버튼을 눌러 `/6`으로 이동하면 같은 상세 컴포넌트를 재사용하면서 `postId`만 바뀝니다. `postId`가 바뀔 때 `useEffect`가 다시 실행되어 6번 게시글 데이터를 요청합니다.

### 존재하지 않는 게시글 처리

```jsx
if (!postData.id) {
  throw new Error("해당 게시글을 찾을 수 없습니다.");
}
```

JSONPlaceholder가 존재하지 않는 게시글에 빈 객체를 반환할 수 있으므로 `id`가 없으면 에러 상태로 처리합니다.

### 이전 글과 다음 글

```jsx
<button
  onClick={() => navigate(`/${postId - 1}`)}
  disabled={postId <= 1}
>
  ← 이전 글
</button>
```

```jsx
<button
  onClick={() => navigate(`/${postId + 1}`)}
  disabled={postId >= LAST_POST_ID}
>
  다음 글 →
</button>
```

`navigate`를 이용해 URL을 변경합니다. JSONPlaceholder 게시글이 1번부터 100번까지 있으므로 첫 게시글과 마지막 게시글에서는 해당 방향의 버튼을 비활성화합니다.

---

## 7. `AbortController`를 사용하는 이유

각 페이지의 API 요청에는 다음 코드가 들어 있습니다.

```jsx
const controller = new AbortController();
```

요청할 때 `signal`을 전달합니다.

```jsx
fetchGetPosts(controller.signal)
```

컴포넌트가 화면에서 사라질 때 요청을 취소합니다.

```jsx
return () => controller.abort();
```

사용자가 요청 도중 다른 페이지로 이동했을 때 더 이상 필요 없는 요청이 완료된 뒤 state를 변경하는 일을 막습니다. 요청 취소로 발생한 `AbortError`는 사용자에게 보여줄 실제 API 오류가 아니므로 제외합니다.

```jsx
if (requestError.name !== "AbortError") {
  setError(requestError.message);
}
```

---

## 8. 로딩·성공·실패 상태

API를 사용하는 화면은 크게 세 가지 상태를 가집니다.

```text
요청 시작 → 로딩
          ├── 성공 → 데이터 출력
          └── 실패 → 에러 메시지 출력
```

요청 전에는 기존 에러를 지웁니다.

```jsx
setIsLoading(true);
setError(null);
```

성공하면 데이터를 state에 저장합니다.

```jsx
setPosts(postData);
```

실패하면 에러 메시지를 저장합니다.

```jsx
setError(requestError.message);
```

마지막에는 로딩을 종료합니다.

```jsx
setIsLoading(false);
```

---

## 9. 복습할 핵심 개념

1. 부모가 모든 데이터를 가질 필요는 없습니다. 실제로 사용하는 컴포넌트가 데이터를 관리할 수 있습니다.
2. 서로 의존하지 않는 API 요청은 `Promise.all`로 병렬 실행할 수 있습니다.
3. URL 값은 `useParams`로 읽고, 화면 이동은 `navigate`나 `Link`를 사용합니다.
4. `useEffect`의 의존성 값이 변경되면 effect가 다시 실행됩니다.
5. API 화면에는 로딩, 성공, 실패 상태가 필요합니다.
6. 컴포넌트가 사라질 때 `AbortController`로 불필요한 요청을 취소할 수 있습니다.
7. `http.js`에 요청 코드를 모으면 API 주소, 에러 검사, JSON 변환의 중복을 줄일 수 있습니다.

## 10. 실행 및 검사 명령어

개발 서버 실행:

```bash
npm run dev
```

프로덕션 빌드 확인:

```bash
npm run build
```

린트 검사:

```bash
npm run lint
```
