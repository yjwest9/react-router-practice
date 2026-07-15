import { useEffect, useState } from "react";
import { fetchGetPosts, fetchGetUsers } from "../http";
import ListCard from "./ListCard";

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <main className="home-page">
      <header className="page-heading">
        <span className="page-heading__eyebrow">React Router Practice</span>
        <h1>Posts</h1>
        <p>게시글을 선택해 자세한 내용과 댓글을 확인해 보세요.</p>
      </header>

      {isLoading && (
        <p className="status-message">게시글을 불러오는 중입니다.</p>
      )}
      {error && <p className="status-message status-message--error">{error}</p>}

      {!isLoading && !error && (
        <section className="card-grid" aria-label="게시글 목록">
          {posts.map((post) => {
            const user = users.find((item) => item.id === post.userId);
            return <ListCard key={post.id} post={post} user={user} />;
          })}
        </section>
      )}
    </main>
  );
}

export default HomePage;
