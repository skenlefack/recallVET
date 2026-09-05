import React, { Fragment, useState, useRef } from "react";
import Highlight from "react-highlight";
import {Link} from 'react-router-dom';
/// Image
import img1 from "../../../images/card/1.png";
import img2 from "../../../images/card/2.png";
import img3 from "../../../images/card/3.png";
/// Bootstrap
import { Row, Card, Col, Button, Nav, Tab } from "react-bootstrap";

const sidebarLink = [
  {title:'Card Title', to:'card-title-1'},
  {title:'Card Title-2', to:'card-title-2'},
  {title:'Card Title-3', to:'card-title-3'},
  {title:'Special Title Treatment', to:'special-title'},
  {title:'Primary Card Title', to:'primary-card'},
  {title:'Secondary Card Title', to:'secondary-card'},
  {title:'Success Card Title', to:'success-card'},
  {title:'Danger Card Title', to:'danger-card'},
  {title:'Warning Card Title', to:'warning-card'},
  {title:'Info Card Title', to:'info-card' },
  {title:'Light Card Title', to:'light-card' },
  {title:'Dark Card Title', to:'dark-card' },
  {title:'Card Title-4'  , to:'card-title-4'},
  {title:'Card Title-5' , to:'card-title-5'},
  {title:'Card Title-6' , to:'card-title-6'} , 
]
const UiCards = () => {
  const [activeLink ,setActiveLink] = useState(0);
  const arrayRefs = useRef([]);
  arrayRefs.current = [];
  function allRefs(el) {
      if (el && !arrayRefs.current.includes(el)) {
          arrayRefs.current.push(el);
      };      
  }
  const scrooBtn = (ind) => {
    arrayRefs.current[ind].scrollIntoView({ behavior: 'smooth' });      
  }
  return (
    <Fragment>    
        <div className="element-area">
          <div className="demo-view">
            <div className="container-fluid pt-0 ps-0 pe-lg-4 pe-0">
              <Row>
                <Col xl="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card ref={(el) => allRefs(el)} className="dz-card">
                      <Card.Header className="flex-wrap">
                        <div>
                          <Card.Title>Card title</Card.Title>
                        </div>
                        <Nav as="ul" className="nav nav-tabs dzm-tabs" id="myTab" role="tablist">
                          <Nav.Item as="li" className="nav-item" role="presentation">
                            <Nav.Link as="button"  type="button" eventKey="Preview">Preview</Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item" >
                            <Nav.Link as="button"  type="button" eventKey="Code">React</Nav.Link>
                          </Nav.Item>
                        </Nav> 
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <Card.Body>
                            <Card.Text className="card-para-card">
                              He lay on his armour-like back, and if he lifted his head a
                              little he could see his brown belly, slightly domed and divided
                              by arches into stiff <br /> sections. The bedding was hardly
                              able to cover it and seemed ready to slide off any moment.
                            </Card.Text>
                          </Card.Body>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                        <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`

  <Card.Text>
    He lay on his armour-like back, and if he lifted his head a
    little he could see his brown belly, slightly domed and divided
    by arches into stiff <br /> sections. The bedding was hardly
    able to cover it and seemed ready to slide off any moment.
  </Card.Text>
  `}
  </Highlight>
  </code></pre>
  </div>
                        </Tab.Pane>

                      </Tab.Content>    
                    </Card>
                  </Tab.Container>  
                </Col>
                <Col xl="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card ref={(el) => allRefs(el)} className="dz-card">
                      <Card.Header>
                        <div>
                          <Card.Title>Card title</Card.Title>
                        </div>
                        <Nav as="ul" className="nav nav-tabs dzm-tabs" id="myTab" role="tablist">
                            <Nav.Item as="li" className="nav-item" role="presentation">
                              <Nav.Link as="button"  type="button" eventKey="Preview">Preview</Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li" className="nav-item" >
                              <Nav.Link as="button"  type="button" eventKey="Code">React</Nav.Link>
                            </Nav.Item>
                          </Nav> 
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <Card.Body>
                            <Card.Text className="card-para-card">
                              This is a wider card with supporting text and below as a natural
                              lead-in to the additional content. This content is a little
                              <br /> bit longer. Some quick example text to build the bulk{" "}
                            </Card.Text>
                          </Card.Body>
                          <Card.Footer className="d-sm-flex justify-content-between align-items-center">
                            <Card.Text className="card-para-card text-dark d-inline">
                              Last updated 3 mins ago
                            </Card.Text>

                            <Link to={"#"} className="btn btn-primary light">
                              Go somewhere
                            </Link>
                          </Card.Footer>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                        <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Card.Body>
    <Card.Text>
      This is a wider card with supporting text and below as a natural
      lead-in to the additional content. This content is a little
      <br /> bit longer. Some quick example text to build the bulk{" "}
    </Card.Text>
    </Card.Body>
    <Card.Footer className=" d-sm-flex justify-content-between align-items-center">
    <Card.Text className="card-para-card text-dark d-inline">
      Last updated 3 mins ago
    </Card.Text>

    <Link to={"#"} className="btn btn-primary light">
      Go somewhere
    </Link>
  </Card.Footer>
  `}
  </Highlight>
  </code></pre>
  </div>

                        </Tab.Pane>
                      </Tab.Content>  
                    </Card>
                  </Tab.Container>  
                </Col>
                <Col xl="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="text-center dz-card" ref={(el) => allRefs(el)} >
                      <Card.Header>
                        <div>
                        <Card.Title>Card Title</Card.Title>
                        </div>
                        <Nav as="ul" className="nav nav-tabs dzm-tabs" id="myTab" role="tablist">
                            <Nav.Item as="li" className="nav-item" role="presentation">
                              <Nav.Link as="button"  type="button" eventKey="Preview">Preview</Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li" className="nav-item" >
                              <Nav.Link as="button"  type="button" eventKey="Code">React</Nav.Link>
                            </Nav.Item>
                          </Nav> 
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <Card.Body>
                            <Card.Text className="card-para-card">
                              This is a wider card with supporting text and below as a natural
                              lead-in to the additional content. This content
                            </Card.Text>
                            <Button as="a" variant="primary" href="#" className="light mt-3">
                              Go somewhere
                            </Button>
                          </Card.Body>
                          <Card.Footer>
                            <Card.Text className="card-para-card text-dark">
                              Last updateed 3 min ago
                            </Card.Text>
                          </Card.Footer>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                        <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Card.Body>
    <Card.Text>
      This is a wider card with supporting text and below as a natural
      lead-in to the additional content. This content
    </Card.Text>
    <Button as="a" variant="outline-primary" href="#" className="light mt-3">
      Go somewhere
    </Button>
  </Card.Body>
  <Card.Footer>
    <Card.Text className="card-para-card text-dark">
      Last updateed 3 min ago
    </Card.Text>
  </Card.Footer>
  `}
  </Highlight>
  </code></pre>
  </div>
                        </Tab.Pane>
                      </Tab.Content>    
                    </Card>
                  </Tab.Container>  
                </Col>
                <Col xl="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="text-center dz-card" ref={(el) => allRefs(el)}>
                      <Card.Header>
                        <div>
                          <Card.Title>Special title treatment</Card.Title>
                        </div>
                        <Nav as="ul" className="nav nav-tabs dzm-tabs" id="myTab" role="tablist">
                            <Nav.Item as="li" className="nav-item" role="presentation">
                              <Nav.Link as="button"  type="button" eventKey="Preview">Preview</Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li" className="nav-item" >
                              <Nav.Link as="button"  type="button" eventKey="Code">React</Nav.Link>
                            </Nav.Item>
                          </Nav> 
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <Card.Body className=" custom-tab-1">
                            <ul className="nav nav-tabs card-body-tabs mb-3">
                              <Nav.Item as="li">
                                <Nav.Link active href="#">
                                  Active
                                </Nav.Link>
                              </Nav.Item>
                              <Nav.Item as="li">
                                <Nav.Link href="#">Link</Nav.Link>
                              </Nav.Item>
                              <Nav.Item as="li">
                                <Nav.Link disabled href="#">
                                  Disabled
                                </Nav.Link>
                              </Nav.Item>
                            </ul>

                            <Card.Text className="card-para-card">
                              With supporting text below as a natural lead-in to additional
                              content.
                            </Card.Text>
                            <Button variant="primary" href="#" className="light mt-3">
                              Go somewhere
                            </Button>
                          </Card.Body>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                        <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Card.Body className=" custom-tab-1">
    <ul className="nav nav-tabs card-body-tabs mb-3">
      <Nav.Item as="li">
        <Nav.Link active href="#">
          Active
        </Nav.Link>
      </Nav.Item>
      <Nav.Item as="li">
        <Nav.Link href="#">Link</Nav.Link>
      </Nav.Item>
      <Nav.Item as="li">
        <Nav.Link disabled href="#">
          Disabled
        </Nav.Link>
      </Nav.Item>
    </ul>

    <Card.Text>
      With supporting text below as a natural lead-in to additional
      content.
    </Card.Text>
    <Button variant="outline-primary" href="#" className="light mt-3">
      Go somewhere
    </Button>
  </Card.Body>
  `}
  </Highlight>
  </code></pre>
  </div>
                        </Tab.Pane>

                      </Tab.Content>    
                    </Card>
                  </Tab.Container>  
                </Col>
                <Col xl="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="text-white dz-card" ref={(el) => allRefs(el)}>
                      <Card.Header>
                        <div>
                          <Card.Title>Primary card title</Card.Title>
                        </div>
                        <Nav as="ul" className="nav nav-tabs dzm-tabs" id="myTab" role="tablist">
                            <Nav.Item as="li" className="nav-item" role="presentation">
                              <Nav.Link as="button"  type="button" eventKey="Preview">Preview</Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li" className="nav-item" >
                              <Nav.Link as="button"  type="button" eventKey="Code">React</Nav.Link>
                            </Nav.Item>
                          </Nav> 
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <Card.Body className=" mb-0">
                            <Card.Text className="card-para-card">
                              Some quick example text to build on the card title and make up
                              the bulk of the card's content.
                            </Card.Text>
                            <Button
                              as="a"
                              variant=" "
                              href="#"
                              className="btn-card btn-primary light mt-3"
                            >
                              Go somewhere
                            </Button>
                          </Card.Body>
                          <Card.Footer className=" bg-transparent border-0 text-white">
                            Last updateed 3 min ago
                          </Card.Footer>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                        <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Card.Body className=" mb-0">
    <Card.Text>
      Some quick example text to build on the card title and make up
      the bulk of the card's content.
    </Card.Text>
    <Button
      as="a"
      variant=" "
      href="#"
      className="btn-card btn-primary light mt-3"
    >
      Go somewhere
    </Button>
  </Card.Body>
  <Card.Footer className=" bg-transparent border-0 text-white">
    Last updateed 3 min ago
  </Card.Footer>
  `}
  </Highlight>
  </code></pre>
  </div>
                        </Tab.Pane>
                      </Tab.Content>  
                    </Card>
                  </Tab.Container>  
                </Col>
                <Col xl="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="text-white dz-card" ref={(el) => allRefs(el)}>
                      <Card.Header>
                        <div>
                          <Card.Title>
                            Secondary card title
                          </Card.Title>
                        </div>
                        <Nav as="ul" className="nav nav-tabs dzm-tabs" id="myTab" role="tablist">
                            <Nav.Item as="li" className="nav-item" role="presentation">
                              <Nav.Link as="button"  type="button" eventKey="Preview">Preview</Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li" className="nav-item" >
                              <Nav.Link as="button"  type="button" eventKey="Code">React</Nav.Link>
                            </Nav.Item>
                          </Nav> 
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <Card.Body className=" mb-0">
                            <Card.Text className="card-para-card">
                              Some quick example text to build on the card title and make up
                              the bulk of the card's content.
                            </Card.Text>
                            <Button
                              as="a"
                              variant=" "
                              href="#"
                              className="btn-card btn-secondary light mt-3"
                            >
                              Go somewhere
                            </Button>
                          </Card.Body>
                          <Card.Footer className=" bg-transparent border-0 text-white">
                            Last updateed 3 min ago
                          </Card.Footer>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                        <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Card.Body className=" mb-0">
    <Card.Text>
      Some quick example text to build on the card title and make up
      the bulk of the card's content.
    </Card.Text>
    <Button
      as="a"
      variant=" "
      href="#"
      className="btn-card btn-secondary light mt-3"
    >
      Go somewhere
    </Button>
    </Card.Body>
    <Card.Footer className=" bg-transparent border-0 text-white">
    Last updateed 3 min ago
  </Card.Footer>
  `}
  </Highlight>
  </code></pre>
  </div>
                        </Tab.Pane>
                      </Tab.Content>  
                    </Card>
                  </Tab.Container>  
                </Col>
                <Col xl="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="text-white dz-card" ref={(el) => allRefs(el)}>
                      <Card.Header>
                        <div>
                        <Card.Title>Success card title</Card.Title>
                        </div>
                        <Nav as="ul" className="nav nav-tabs dzm-tabs" id="myTab" role="tablist">
                            <Nav.Item as="li" className="nav-item" role="presentation">
                              <Nav.Link as="button"  type="button" eventKey="Preview">Preview</Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li" className="nav-item" >
                              <Nav.Link as="button"  type="button" eventKey="Code">React</Nav.Link>
                            </Nav.Item>
                          </Nav> 
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <Card.Body className=" mb-0">
                            <Card.Text className="card-para-card">
                              Some quick example text to build on the card title and make up
                              the bulk of the card's content.
                            </Card.Text>
                            <Button
                              as="a"
                              variant=" "
                              href="#"
                              className="btn-card btn-success light mt-3"
                            >
                              Go somewhere
                            </Button>
                          </Card.Body>
                          <Card.Footer className=" bg-transparent border-0 text-white">
                            Last updateed 3 min ago
                          </Card.Footer>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                        <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Card.Body className=" mb-0">
    <Card.Text>
      Some quick example text to build on the card title and make up
      the bulk of the card's content.
    </Card.Text>
    <Button
      as="a"
      variant=" "
      href="#"
      className="btn-card btn-success light mt-3"
    >
      Go somewhere
    </Button>
    </Card.Body>
    <Card.Footer className=" bg-transparent border-0 text-white">
    Last updateed 3 min ago
  </Card.Footer>
  `}
  </Highlight>
  </code></pre>
  </div>

                        </Tab.Pane>
                      </Tab.Content>    
                    </Card>
                  </Tab.Container>  
                </Col>
                <Col xl="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="text-white dz-card" ref={(el) => allRefs(el)}>
                      <Card.Header>
                        <div>
                          <Card.Title>Danger card title</Card.Title>
                        </div>
                        <Nav as="ul" className="nav nav-tabs dzm-tabs" id="myTab" role="tablist">
                            <Nav.Item as="li" className="nav-item" role="presentation">
                              <Nav.Link as="button"  type="button" eventKey="Preview">Preview</Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li" className="nav-item" >
                              <Nav.Link as="button"  type="button" eventKey="Code">React</Nav.Link>
                            </Nav.Item>
                          </Nav> 
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <Card.Body className=" mb-0">
                            <Card.Text className="card-para-card">
                              Some quick example text to build on the card title and make up
                              the bulk of the card's content.
                            </Card.Text>
                            <Button
                              as="a"
                              variant=""
                              href="#"
                              className="btn-card btn-danger light mt-3"
                            >
                              Go somewhere
                            </Button>
                          </Card.Body>
                          <Card.Footer className=" bg-transparent border-0 text-white">
                            Last updateed 3 min ago
                          </Card.Footer>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                        <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Card.Body className=" mb-0">
    <Card.Text>
      Some quick example text to build on the card title and make up
      the bulk of the card's content.
    </Card.Text>
    <Button
      as="a"
      variant=""
      href="#"
      className="btn-card btn-danger light mt-3"
    >
      Go somewhere
    </Button>
  </Card.Body>
  <Card.Footer className=" bg-transparent border-0 text-white">
    Last updateed 3 min ago
  </Card.Footer>
  `}
  </Highlight>
  </code></pre>
  </div>

                        </Tab.Pane>
                      </Tab.Content>   
                    </Card>
                  </Tab.Container>  
                </Col>
                <Col xl="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="text-white dz-card" ref={(el) => allRefs(el)}>
                      <Card.Header>
                        <div>
                          <Card.Title>Warning card title</Card.Title>
                        </div>
                        <Nav as="ul" className="nav nav-tabs dzm-tabs" id="myTab" role="tablist">
                            <Nav.Item as="li" className="nav-item" role="presentation">
                              <Nav.Link as="button"  type="button" eventKey="Preview">Preview</Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li" className="nav-item" >
                              <Nav.Link as="button"  type="button" eventKey="Code">React</Nav.Link>
                            </Nav.Item>
                          </Nav>   
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <Card.Body className=" mb-0">
                            <Card.Text className="card-para-card">
                              Some quick example text to build on the card title and make up
                              the bulk of the card's content.
                            </Card.Text>
                            <Button
                              as="a"
                              variant=""
                              href="#"
                              className="btn-card btn-warning light mt-3"
                            >
                              Go somewhere
                            </Button>
                          </Card.Body>
                          <Card.Footer className=" bg-transparent border-0 text-white">
                            Last updateed 3 min ago
                          </Card.Footer>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                        <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Card.Body className=" mb-0">
    <Card.Text>
      Some quick example text to build on the card title and make up
      the bulk of the card's content.
    </Card.Text>
    <Button
      as="a"
      variant=""
      href="#"
      className="btn-card btn-warning light mt-3"
    >
      Go somewhere
    </Button>
  </Card.Body>
  <Card.Footer className=" bg-transparent border-0 text-white">
    Last updateed 3 min ago
  </Card.Footer>
  `}
  </Highlight>
  </code></pre>
  </div>
                        </Tab.Pane>

                      </Tab.Content>    
                    </Card>
                  </Tab.Container> 
                </Col>
                <Col xl="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="text-white dz-card" ref={(el) => allRefs(el)}>
                      <Card.Header>
                        <div>
                          <Card.Title >Info card title</Card.Title>
                        </div>
                        <Nav as="ul" className="nav nav-tabs dzm-tabs" id="myTab" role="tablist">
                            <Nav.Item as="li" className="nav-item" role="presentation">
                              <Nav.Link as="button"  type="button" eventKey="Preview">Preview</Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li" className="nav-item" >
                              <Nav.Link as="button"  type="button" eventKey="Code">React</Nav.Link>
                            </Nav.Item>
                          </Nav> 
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <Card.Body className=" mb-0">
                            <Card.Text className="card-para-card">
                              Some quick example text to build on the card title and make up
                              the bulk of the card's content.
                            </Card.Text>
                            <Button
                              as="a"
                              variant=""
                              href="#"
                              className="btn-card btn-info light mt-3"
                            >
                              Go somewhere
                            </Button>
                          </Card.Body>
                          <Card.Footer className=" bg-transparent border-0 text-white">
                            Last updateed 3 min ago
                          </Card.Footer>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                        <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Card.Body className=" mb-0">
    <Card.Text>
      Some quick example text to build on the card title and make up
      the bulk of the card's content.
    </Card.Text>
    <Button
      as="a"
      variant=""
      href="#"
      className="btn-card btn-info light mt-3"
    >
      Go somewhere
    </Button>
    </Card.Body>
    <Card.Footer className=" bg-transparent border-0 text-white">
    Last updateed 3 min ago
    </Card.Footer>
  `}
  </Highlight>
  </code></pre>
  </div>
                        </Tab.Pane>
                      </Tab.Content>    
                    </Card>
                  </Tab.Container>  
                </Col>
                <Col xl="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" ref={(el) => allRefs(el)}>
                      <Card.Header>
                        <div>
                          <Card.Title>Light card title</Card.Title>
                        </div>
                        <Nav as="ul" className="nav nav-tabs dzm-tabs" id="myTab" role="tablist">
                            <Nav.Item as="li" className="nav-item" role="presentation">
                              <Nav.Link as="button"  type="button" eventKey="Preview">Preview</Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li" className="nav-item" >
                              <Nav.Link as="button"  type="button" eventKey="Code">React</Nav.Link>
                            </Nav.Item>
                          </Nav> 
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <Card.Body className=" mb-0">
                            <Card.Text className="card-para-card">
                              Some quick example text to build on the card title and make up
                              the bulk of the card's content.
                            </Card.Text>
                            <Button as="a" variant="" href="#" className="btn-card btn-light light mt-3">
                              Go somewhere
                            </Button>
                          </Card.Body>
                          <Card.Footer className="bg-transparent border-0">
                            Last updateed 3 min ago
                          </Card.Footer>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                        <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Card.Body className=" mb-0">
    <Card.Text>
      Some quick example text to build on the card title and make up
      the bulk of the card's content.
    </Card.Text>
    <Button as="a" variant="" href="#" className="btn-card btn-light light mt-3">
      Go somewhere
    </Button>
    </Card.Body>
    <Card.Footer className=" bg-transparent border-0">
    Last updateed 3 min ago
  </Card.Footer>
  `}
  </Highlight>
  </code></pre>
  </div>
                        </Tab.Pane>
                      </Tab.Content>  
                    </Card>
                  </Tab.Container>  
                </Col>
                <Col xl="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="text-white dz-card" ref={(el) => allRefs(el)}>
                      <Card.Header>
                        <div>
                        <Card.Title>Dark card title</Card.Title>
                        </div>
                        <Nav as="ul" className="nav nav-tabs dzm-tabs" id="myTab" role="tablist">
                            <Nav.Item as="li" className="nav-item" role="presentation">
                              <Nav.Link as="button"  type="button" eventKey="Preview">Preview</Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li" className="nav-item" >
                              <Nav.Link as="button"  type="button" eventKey="Code">React</Nav.Link>
                            </Nav.Item>
                          </Nav> 
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <Card.Body className=" mb-0">
                            <Card.Text className="card-para-card">
                              Some quick example text to build on the card title and make up
                              the bulk of the card's content.
                            </Card.Text>
                            <Button
                              as="a"
                              variant=""
                              href="#"
                              className="btn-card btn-dark mt-3 text-white"
                            >
                              Go somewhere
                            </Button>
                          </Card.Body>
                          <Card.Footer className=" bg-transparent border-0 text-white">
                            Last updateed 3 min ago
                          </Card.Footer>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                        <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Card.Body className=" mb-0">
    <Card.Text>
      Some quick example text to build on the card title and make up
      the bulk of the card's content.
    </Card.Text>
    <Button
      as="a"
      variant=""
      href="#"
      className="btn-card btn-dark mt-3 text-white"
    >
      Go somewhere
    </Button>
  </Card.Body>
  <Card.Footer className=" bg-transparent border-0 text-white">
    Last updateed 3 min ago
  </Card.Footer>
  `}
  </Highlight>
  </code></pre>
  </div>
                        </Tab.Pane>

                      </Tab.Content> 
                    </Card>
                  </Tab.Container>  
                </Col>
                <Col xl="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card ref={(el) => allRefs(el)} className="dz-card">
                      <img
                        className="card-img-top img-fluid"
                        src={img1}
                        alt="Card cap"
                      />
                      <Card.Header>
                        <div>
                          <Card.Title>Card title</Card.Title>
                        </div>
                        <Nav as="ul" className="nav nav-tabs dzm-tabs" id="myTab" role="tablist">
                            <Nav.Item as="li" className="nav-item" role="presentation">
                              <Nav.Link as="button"  type="button" eventKey="Preview">Preview</Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li" className="nav-item" >
                              <Nav.Link as="button"  type="button" eventKey="Code">React</Nav.Link>
                            </Nav.Item>
                          </Nav> 
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <Card.Body>
                            <Card.Text className="card-para-card mb-2">
                              This is a wider card with supporting text below as a natural
                              lead-in to additional content. This content is a little bit
                              longer.
                            </Card.Text>
                            <Card.Text className="card-para-cardmt-3 text-dark">
                              Last updated 3 mins ago
                            </Card.Text>
                          </Card.Body>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                        <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Card.Body>
    <Card.Text>
      This is a wider card with supporting text below as a natural
      lead-in to additional content. This content is a little bit
      longer.
    </Card.Text>
    <Card.Text className="card-para-cardmt-3 text-dark">
      Last updated 3 mins ago
    </Card.Text>
  </Card.Body>
  `}
  </Highlight>
  </code></pre>
  </div>
                        </Tab.Pane>
                      </Tab.Content>    
                    </Card>
                  </Tab.Container>  
                </Col>
                <Col xl="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card ref={(el) => allRefs(el)} className="dz-card">
                      <img
                        className="card-img-top img-fluid"
                        src={img2}
                        alt="Card cap"
                      />
                      <Card.Header>
                        <div>
                          <Card.Title>Card title</Card.Title>
                        </div>
                        <Nav as="ul" className="nav nav-tabs dzm-tabs" id="myTab" role="tablist">
                            <Nav.Item as="li" className="nav-item" role="presentation">
                              <Nav.Link as="button"  type="button" eventKey="Preview">Preview</Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li" className="nav-item" >
                              <Nav.Link as="button"  type="button" eventKey="Code">React</Nav.Link>
                            </Nav.Item>
                          </Nav> 
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <Card.Body>
                            <Card.Text className="card-para-card">
                              He lay on his armour-like back, and if he lifted his head a
                              little
                            </Card.Text>
                          </Card.Body>
                          <Card.Footer>
                            <Card.Text className="card-para-card d-inline">Card footer</Card.Text>
                            <Link to="/ui-card" className="card-link float-end">
                              Card link
                            </Link>
                          </Card.Footer>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                        <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Card.Body>
    <Card.Text>
      He lay on his armour-like back, and if he lifted his head a
      little
    </Card.Text>
  </Card.Body>
  <Card.Footer>
    <Card.Text className="card-para-card d-inline">Card footer</Card.Text>
    <Link to="/ui-card" className="card-link float-end">
      Card link
    </Link>
  </Card.Footer>
  `}
  </Highlight>
  </code></pre>
  </div>
                        </Tab.Pane>

                        </Tab.Content>  
                    </Card>
                  </Tab.Container>  
                </Col>
                <Col xl="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card ref={(el) => allRefs(el)} className="dz-card">
                      <Card.Header>
                        <div>
                          <Card.Title>Card title</Card.Title>
                        </div>
                        <Nav as="ul" className="nav nav-tabs dzm-tabs" id="myTab" role="tablist">
                            <Nav.Item as="li" className="nav-item" role="presentation">
                              <Nav.Link as="button"  type="button" eventKey="Preview">Preview</Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li" className="nav-item" >
                              <Nav.Link as="button"  type="button" eventKey="Code">React</Nav.Link>
                            </Nav.Item>
                          </Nav> 
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <Card.Body>
                            <Card.Text className="card-para-card">
                              This is a wider card with supporting text and below as a natural
                              lead-in to the additional content. This content is a little
                            </Card.Text>
                          </Card.Body>
                          <img
                            className="card-img-bottom border-0 img-fluid"
                            src={img3}
                            alt="Card cap"
                          />
                          <Card.Footer>
                            <Card.Text className="card-para-card d-inline">Card footer</Card.Text>
                            <Link to="/ui-card" className="card-link float-end">
                              Card link
                            </Link>
                          </Card.Footer>
                        </Tab.Pane>  
                        <Tab.Pane eventKey="Code">  
                        <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Card.Body>
    <Card.Text>
      This is a wider card with supporting text and below as a natural
      lead-in to the additional content. This content is a little
    </Card.Text>
  </Card.Body>
  <img
    className="card-img-bottom img-fluid"
    src={img3}
    alt="Card cap"
  />
  <Card.Footer>
    <Card.Text className="card-para-card d-inline">Card footer</Card.Text>
    <Link to="/ui-card" className="card-link float-end">
      Card link
    </Link>
  </Card.Footer>
  `}
  </Highlight>
  </code></pre>
  </div>
                        </Tab.Pane>  
                      </Tab.Content>  
                    </Card>
                  </Tab.Container>  
                </Col>
              </Row>
            </div>
          </div>
          <div className="demo-right ">
              <div className="demo-right-inner dlab-scroll " id="right-sidebar">
                  <h4 className="title mb-2">Card</h4>
                  <ul className="navbar-nav" id="menu-bar">
                    {sidebarLink.map((item, ind)=>(
                      <li key={ind} className={`${ind === activeLink ? 'active' :  ''} `} >
                        <Link to={"#"} 
                          className={`scroll ${ind === activeLink ? 'active' :  ''} `}                        
                          onClick={() => { scrooBtn(ind); setActiveLink(ind) }}  
                        > 
                          {item.title}
                        </Link>
                      </li>
                    ))}     
                                    
                  </ul>	
              </div>
             </div>	
        
        </div>    
      
    </Fragment>
  );
};

export default UiCards;
