import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <h1 className='font-mono text-lg'>Home</h1>
      <Link to={'/todos'}>Todo List</Link>
    </>
  );
}
