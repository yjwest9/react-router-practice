import { useEffect } from "react";
import ListCard from "./ListCard";

function HomePage({ fetchData, getPosts, getUsers }) {
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <main className="home-page">
      <header className="page-heading">
        <span className="page-heading__eyebrow">React Router Practice</span>
        <h1>Posts</h1>
        <p>게시글을 선택해 자세한 내용과 댓글을 확인해 보세요.</p>
      </header>
      <section className="card-grid" aria-label="게시글 목록">
      {getPosts.map((post) => {
        const user = getUsers.find((user) => user.id === post.userId);
        return <ListCard key={post.id} post={post} user={user} />;
      })}
      </section>
    </main>
  );
}

export default HomePage;
