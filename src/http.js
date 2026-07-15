export async function fetchGetPosts() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await res.json();
  if (!res.ok) {
    throw new Error("api호출에 실패했습니다.");
  }

  return data;
}

export async function fetchGetUsers() {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  const data = await res.json();
  if (!res.ok) {
    throw new Error("api호출에 실패했습니다.");
  }

  return data;
}

export async function fetchGetComments() {
  const res = await fetch("https://jsonplaceholder.typicode.com/comments");
  const data = await res.json();
  if (!res.ok) {
    throw new Error("api호출에 실패했습니다.");
  }

  return data;
}
