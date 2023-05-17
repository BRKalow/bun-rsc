import Button from "../components/button";

function App() {
  return (
    <div className="App" role="main">
      <article className="App-article">
        <img src={"/bunlogo.svg"} className="App-logo" alt="logo" />
        <div style={{ height: "30px" }}></div>
        <h3>Welcome to Bun, from server components!</h3>
        <div style={{ height: "10px" }}></div>
        <a
          className="App-link"
          href="https://bun.sh/docs"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the docs →
        </a>
        <br />
        <Button>Click me</Button>
      </article>
    </div>
  );
}

export default App;
