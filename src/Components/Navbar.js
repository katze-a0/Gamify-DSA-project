import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import "../styles/styles.css";

function NavBar() {
  return (
    <Navbar expand="lg" style={{ backgroundColor: "#1E293B" }}>
      <Container>
        <Navbar.Brand style={{ color: "white",  fontFamily: "Montserrat" }} href="/">
          GRAPHIFY
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="navbar-custom">
          <Nav className="ms-auto">
          <NavDropdown title="Algorithm">
              <NavDropdown.Item href="prims">
                Prim's Algorithm
              </NavDropdown.Item>
              <NavDropdown.Item href="kruskals">
                Kruskal's Algorithm
              </NavDropdown.Item>
              <NavDropdown.Item href="dijkstras">
                Dijkstra's Algorithm
              </NavDropdown.Item>
              <NavDropdown.Divider />
            </NavDropdown>
            <Nav.Link href="learnMore">Learn More</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
