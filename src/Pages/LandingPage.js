import Button from "react-bootstrap/Button";
import "../styles/landingPage.css";
import Card from "react-bootstrap/Card";
import ChatbotComponent from "./ChatBot";
import "../styles/ChatBot.css";

const LandingPage = () => {
  return (
    <div className="pageStyle">
      <div className="containerStyle">
        <h1>GRAPHIFY</h1>
      </div>
      <div className="descriptionStyle">
        A graph visualiser web with gaming features to make the learning
        platform more engaging
      </div>

      <div className="cardStyle">
        <Card.Link href="/prims">
          <Card className="card">
            <Card.Body>
              <Card.Title style={{ color: " #ff00cc" }}>
                Prim's
                <br />
                Algorithm
              </Card.Title>
            </Card.Body>
          </Card>
        </Card.Link>
        <Card.Link href="/kruskals">
          <Card className="card">
            <Card.Body>
              <Card.Title style={{ color: "yellowgreen" }}>
                Kruskal's
                <br />
                Algorithm
              </Card.Title>
            </Card.Body>
          </Card>
        </Card.Link>
        <Card.Link href="/dijkstras">
          <Card className="card">
            <Card.Body>
              <Card.Title style={{ color: " #C084FC" }}>
                Dijkstra's
                <br />
                Algorithm
              </Card.Title>
            </Card.Body>
          </Card>
        </Card.Link>
      </div>
      <Button variant="secondary" href="/learnmore" className="btn">
        Learn More
      </Button>

      <ChatbotComponent />
    </div>
  );
};

export default LandingPage;
