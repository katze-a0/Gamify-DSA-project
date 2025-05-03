import { BrowserRouter, Switch, Route } from "react-router-dom";
import Prim from "../Pages/Prims";
import Kruskal from "../Pages/Kruskals";
import Dijktra from "../Pages/Dijktras";
import LandingPage from "../Pages/LandingPage";
import LearnMore from "../Pages/LearnMore";


const Router = () => {
  return (
    <BrowserRouter>
      <Switch></Switch>
      <Route path="/" component={LandingPage} exact/>
      <Route path="/prims" component={Prim} />
      <Route path="/kruskals" component={Kruskal} />
      <Route path="/dijkstras" component={Dijktra} />
      <Route path="/learnMore" component={LearnMore} />
    </BrowserRouter>
  );
};
export default Router;
