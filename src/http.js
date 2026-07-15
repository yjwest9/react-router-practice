const API_URL = "https://jsonplaceholder.typicode.com";

async function request(path, signal) {
  const response = await fetch(`${API_URL}${path}`, { signal });

  if (!response.ok) {
    throw new Error(`API 요청에 실패했습니다. (${response.status})`);
  }

  return response.json();
}

export function fetchGetPosts(signal) {
  return request("/posts", signal);
}

export function fetchGetUsers(signal) {
  return request("/users", signal);
}

export function fetchGetPost(postId, signal) {
  return request(`/posts/${postId}`, signal);
}

export function fetchGetPostComments(postId, signal) {
  return request(`/posts/${postId}/comments`, signal);
}
