import React, {useState, useRef} from 'react'
import { Fragment } from 'react';
import Highlight from "react-highlight";
import {Link} from 'react-router-dom';

/// Images
import img1 from '../../../images/big/img1.jpg'
import img2 from '../../../images/big/img2.jpg'
import img3 from '../../../images/big/img3.jpg'
import img4 from '../../../images/big/img4.jpg'
import img5 from '../../../images/big/img5.jpg'
import img6 from '../../../images/big/img6.jpg'
import img7 from '../../../images/big/img7.jpg'

/// Bootstrap
import { Row, Col, Card, Carousel, Nav, Tab } from 'react-bootstrap'

/// carousel data
const carousel1 = [img1, img2, img3]
const carousel2 = [
  { img: img2, text: 'First' },
  { img: img3, text: 'Second' },
  { img: img4, text: 'Third' },
]
const carousel3 = [img3, img4, img5]

const carousel5 = [
  { img: img5, text: 'First' },
  { img: img6, text: 'Second' },
  { img: img7, text: 'Third' },
]

const sidebarLink = [
  {title:'Slides', to:'slides-only'},
  {title:'With Captions', to:'with-captions'},
  {title:'Only Slides', to:'slides-only-1'},
  {title:'Slides With Indicators', to:'slides-indicators'},
  {title:'Slides With Captions', to:'slides-captions'},
]
const UiCarousel = () => {
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
                  <Col xl={12}>
                    <Tab.Container defaultActiveKey="Preview">
                      <Card ref={(el) => allRefs(el)} className="dz-card">
                        <Card.Header className="flex-wrap border-0 pb-0">
                            <h4 className='card-intro-title mb-0'>Slides</h4>
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
                              <Card.Body className='p-4'>
                                <Carousel>
                                  {carousel1.map((carousel, i) => (
                                    <Carousel.Item key={i}>
                                      <img
                                        src={carousel}
                                        className='d-block w-100'
                                        alt={`Slide ${i + 1}`}
                                      />
                                    </Carousel.Item>
                                  ))}
                                </Carousel>
                              </Card.Body>
                            </Tab.Pane>
                            <Tab.Pane eventKey="Code">
                            <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Carousel>
    {carousel1.map((carousel, i) => (
      <Carousel.Item key={i}>
      <img
          src={carousel}
          className='d-block w-100'
          alt={\`Slide $\{i + 1}\`}
        />
      </Carousel.Item>
    ))}
  </Carousel>
  `}
  </Highlight>
  </code></pre>
  </div>
                            </Tab.Pane>

                          </Tab.Content>    
                      </Card>
                    </Tab.Container>  
                  </Col>
                  <Col xl={12}>
                    <Tab.Container defaultActiveKey="Preview">
                      <Card ref={(el) => allRefs(el)} className="dz-card">
                          <Card.Header className="flex-wrap border-0 pb-0">
                          <h4 className='card-intro-title mb-0'>With Captions</h4>
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
                              <Card.Body className='p-4'>
                                <Carousel controls={false} indicators={false}>
                                  {carousel2.map((carousel, i) => (
                                    <Carousel.Item key={i}>
                                      <img
                                        className='d-block w-100'
                                        src={carousel.img}
                                        alt={`${carousel.text} slide`}
                                      />
                                      <Carousel.Caption className=' d-none d-md-block'>
                                        <h5>{carousel.text} slide label</h5>
                                        <p>
                                          Nulla vitae elit libero, a pharetra augue mollis
                                          interdum.
                                        </p>
                                      </Carousel.Caption>
                                    </Carousel.Item>
                                  ))}
                                </Carousel>
                              </Card.Body>
                            </Tab.Pane>
                            <Tab.Pane eventKey="Code">
                            <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Carousel controls={false} indicators={false}>
    {carousel2.map((carousel, i) => (
      <Carousel.Item key={i}>
        <img
          className='d-block w-100'
          src={carousel.img}
          alt={\`$\{carousel.text} slide\`}
        />
        <Carousel.Caption className=' d-none d-md-block'>
          <h5>{carousel.text} slide label</h5>
          <p>
            Nulla vitae elit libero, a pharetra augue mollis
            interdum.
          </p>
        </Carousel.Caption>
      </Carousel.Item>
    ))}
  </Carousel>
  `}
  </Highlight> 
  </code></pre>
  </div>
                            </Tab.Pane>
                          </Tab.Content>  
                      </Card>
                    </Tab.Container>  
                  </Col>
                  <Col xl={12}>
                    <Tab.Container defaultActiveKey="Preview">
                      <Card ref={(el) => allRefs(el)} className="dz-card">
                          <Card.Header className="flex-wrap border-0 pb-0">
                            <h4 className='card-intro-title mb-0'>Only Slides</h4>
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
                              <Card.Body className='p-4'>
                                <Carousel controls={false} indicators={false}>
                                  {carousel3.map((carousel, i) => (
                                    <Carousel.Item key={i}>
                                      <img
                                        src={carousel}
                                        className='d-block w-100'
                                        alt={`Slide ${i + 1}`}
                                      />
                                    </Carousel.Item>
                                  ))}
                                </Carousel>
                              </Card.Body>
                              </Tab.Pane>
                              <Tab.Pane eventKey="Code">
                              <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Carousel controls={false} indicators={false}>
    {carousel3.map((carousel, i) => (
      <Carousel.Item key={i}>
        <img
          src={carousel}
          className='d-block w-100'
          alt={\`Slide $\{i + 1}\`}
        />
      </Carousel.Item>
    ))}
  </Carousel>
  `}
  </Highlight>
  </code></pre>
  </div>

                              </Tab.Pane>
                            </Tab.Content>
                      </Card>
                    </Tab.Container>  
                  </Col>
                  <Col xl={12}>
                    <Tab.Container defaultActiveKey="Preview">
                      <Card ref={(el) => allRefs(el)} className="dz-card">
                          <Card.Header className="flex-wrap border-0 pb-0">
                            <h4 className='card-intro-title mb-0'>Slides With Indicators</h4>
                          
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
                              <Card.Body className='p-4'>
                                <Carousel>
                                  {carousel1.map((carousel, i) => (
                                    <Carousel.Item key={i}>
                                      <img
                                        src={carousel}
                                        className='d-block w-100'
                                        alt={`Slide ${i + 1}`}
                                      />
                                    </Carousel.Item>
                                  ))}
                                </Carousel>
                              </Card.Body>
                            </Tab.Pane>
                            <Tab.Pane eventKey="Code">
                            <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Carousel>
    {carousel1.map((carousel, i) => (
      <Carousel.Item key={i}>
        <img
          src={carousel}
          className='d-block w-100'
          alt={\`Slide $\{i + 1}\`}
        />
      </Carousel.Item>
    ))}
  </Carousel>
  `}
  </Highlight>
  </code></pre>
  </div>

                            </Tab.Pane>

                          </Tab.Content>   
                      </Card>
                    </Tab.Container> 
                  </Col>
                  <Col xl={12}>
                    <Tab.Container defaultActiveKey="Preview">
                      <Card ref={(el) => allRefs(el)} className="dz-card">
                          <Card.Header className="flex-wrap border-0 pb-0">
                            <h4 className='card-intro-title mb-0'>Slides With Captions</h4>
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
                              <Card.Body className='p-4'>
                                <Carousel>
                                  {carousel5.map((carousel, i) => (
                                    <Carousel.Item key={i}>
                                      <img
                                        className='d-block w-100'
                                        src={carousel.img}
                                        alt={`${carousel.text} slide`}
                                      />
                                      <Carousel.Caption className=' d-none d-md-block'>
                                        <h5>{carousel.text} slide label</h5>
                                        <p>
                                          Nulla vitae elit libero, a pharetra augue mollis
                                          interdum.
                                        </p>
                                      </Carousel.Caption>
                                    </Carousel.Item>
                                  ))}
                                </Carousel>
                              </Card.Body>
                            </Tab.Pane>
                            <Tab.Pane eventKey="Code">
                            <div className="card-body pt-0 p-0 code-area">
  <pre className="mb-0"><code className="language-html">
  <Highlight>
  {`
  <Carousel>
    {carousel5.map((carousel, i) => (
      <Carousel.Item key={i}>
        <img
          className='d-block w-100'
          src={carousel.img}
          alt={\`$\{carousel.text} slide\`}
        />
        <Carousel.Caption className=' d-none d-md-block'>
          <h5>{carousel.text} slide label</h5>
          <p>
            Nulla vitae elit libero, a pharetra augue mollis
            interdum.
          </p>
        </Carousel.Caption>
      </Carousel.Item>
    ))}
  </Carousel>
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
                    <h4 className="title mb-2">Carousel</h4>
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
  )
}

export default UiCarousel
