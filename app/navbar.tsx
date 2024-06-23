import Link from "next/link";

const Navbar = () => {
  return (
    <nav>
      <ul className="flex gap-10 py-5 px-3 bg-[#BDE5F8] font-bold text-xl">
        <li>
          <Link href="/">
            <p className="text-[#E87531]">AI Chatbot w/ CDs</p>
          </Link>
        </li>
        <li>
          <Link href="/diagram">
            <p className="text-black/80">Diagram</p>
          </Link>
        </li>
        <li>
          <Link href="/indexing">
            <p className="text-black/80">Indexing</p>
          </Link>
        </li>
        <li>
          <Link href="/rag">
            <p className="text-black/80">RAG</p>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;