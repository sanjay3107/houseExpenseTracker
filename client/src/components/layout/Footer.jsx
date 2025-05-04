import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-dark text-white py-3 mt-auto"
      style={{
        background: 'linear-gradient(to right, #1a2a3a, #3a4db9)',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.2)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        marginLeft: 0,
        marginRight: 0,
        width: '100vw',
        position: 'relative',
        left: '0',
        right: '0',
      }}
    >
      <Container fluid>
        <Row className="py-3">
          <Col md={6} className="text-center text-md-start">
            <h5 className="mb-0">
              <i className="bi bi-house-heart-fill me-2"></i>
              House Expense Tracker
            </h5>
            <p className="small mb-0 mt-2">
              Track expenses, manage loans, and plan your financial future
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-3 mt-3 mt-md-0">
              <a href="#" className="text-white" aria-label="Github">
                <i className="bi bi-github"></i>
              </a>
              <a href="#" className="text-white" aria-label="Twitter">
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="#" className="text-white" aria-label="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </Col>
        </Row>
        <hr className="my-2 bg-light opacity-25" />
        <Row className="py-2">
          <Col className="text-center">
            <p className="mb-0 small">
              &copy; {currentYear} House Expense Tracker. All Rights Reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
