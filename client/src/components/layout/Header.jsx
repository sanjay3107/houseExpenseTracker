import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll event to add shadow to navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <Navbar 
      bg="white" 
      variant="light" 
      expand="lg" 
      className={`py-2 border-bottom ${scrolled ? 'shadow-sm' : ''}`}
      sticky="top"
      style={{ width: '100vw', marginLeft: '0', marginRight: '0', left: '0' }}
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <i className="bi bi-house-heart-fill text-primary me-2 fs-4"></i>
          <span className="fw-bold">House Expense Tracker</span>
          <Badge bg="primary" className="ms-2 fs-6">Beta</Badge>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {currentUser ? (
              <>
                <Nav.Link as={NavLink} to="/" end className={location.pathname === '/' ? 'active fw-bold' : ''}>
                  <i className="bi bi-speedometer2 me-1"></i> Dashboard
                </Nav.Link>
                <Nav.Link as={NavLink} to="/house-details" className={location.pathname === '/house-details' ? 'active fw-bold' : ''}>
                  <i className="bi bi-house-door me-1"></i> House Details
                </Nav.Link>
                <Nav.Link as={NavLink} to="/expenses" className={location.pathname.includes('/expenses') ? 'active fw-bold' : ''}>
                  <i className="bi bi-cash-coin me-1"></i> Expenses
                </Nav.Link>
                <NavDropdown 
                  title={<><i className="bi bi-calculator me-1"></i> Calculators</>} 
                  id="calculators-dropdown"
                  active={location.pathname.includes('calculator')}
                >
                  <NavDropdown.Item as={NavLink} to="/loan-calculator">
                    <i className="bi bi-bank me-2"></i> Loan Calculator
                  </NavDropdown.Item>
                  <NavDropdown.Item as={NavLink} to="/prepayment-calculator">
                    <i className="bi bi-graph-down-arrow me-2"></i> Prepayment Calculator
                  </NavDropdown.Item>
                </NavDropdown>
                <NavDropdown 
                  title={
                    <div className="d-inline-block">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary text-white rounded-circle p-1 d-flex align-items-center justify-content-center me-1" style={{width: '24px', height: '24px'}}>
                          <i className="bi bi-person-fill fs-6"></i>
                        </div>
                        <span>{currentUser.user_metadata?.name || currentUser.email?.split('@')[0]}</span>
                      </div>
                    </div>
                  } 
                  id="user-dropdown" 
                  align="end"
                >
                  <NavDropdown.Item disabled className="text-muted small">
                    <i className="bi bi-envelope me-2"></i> {currentUser.email}
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2 text-danger"></i> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login" className="me-2">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Login
                </Nav.Link>
                <Nav.Link as={NavLink} to="/register" className="btn btn-primary text-white">
                  <i className="bi bi-person-plus me-1"></i> Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
