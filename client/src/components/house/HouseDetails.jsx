import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import API_ENDPOINTS from '../../config/api';
import { formatIndianCurrency } from '../../utils/currencyFormatter';

const HouseDetails = () => {
  const [houseDetails, setHouseDetails] = useState({
    address: {
      street: '',
      city: '',
      state: '',
      zip_code: '',
      country: ''
    },
    purchase_details: {
      purchase_date: '',
      purchase_price: '',
      down_payment: '',
      closing_costs: ''
    },
    property_details: {
      square_feet: '',
      bedrooms: '',
      bathrooms: '',
      year_built: '',
      lot_size: '',
      property_type: 'Single Family'
    },
    loan_details: {
      loan_amount: '',
      interest_rate: '',
      loan_term: '',
      monthly_payment: '',
      loan_start_date: '',
      lender: '',
      loan_type: 'Fixed Rate'
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasExistingDetails, setHasExistingDetails] = useState(false);

  // Create a reusable function to fetch house details
  const fetchHouseDetails = async () => {
    try {
      setLoading(true);
      // Add cache-busting parameter to prevent browser caching
      const response = await axios.get(`${API_ENDPOINTS.HOUSE.DETAILS}?_t=${new Date().getTime()}`);
      
      if (response.data) {
        console.log('House details from API:', response.data);
        
        // Ensure we have all the required nested objects
        const formattedData = {
          address: response.data.address || {},
          purchase_details: response.data.purchase_details || {},
          property_details: response.data.property_details || {},
          loan_details: response.data.loan_details || {}
        };
        
        // Add the ID if it exists
        if (response.data.id) {
          formattedData.id = response.data.id;
        }
        
        setHouseDetails(formattedData);
        setHasExistingDetails(true);
      }
      
      setLoading(false);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // No house details found, that's okay
        setHasExistingDetails(false);
        setIsEditing(true);
      } else {
        setError(`Error fetching house details: ${err.response?.data?.error || err.message}`);
        console.error('House details fetch error:', err);
      }
      setLoading(false);
    }
  };
  
  // Fetch house details on component mount
  useEffect(() => {
    fetchHouseDetails();
  }, []);

  const handleInputChange = (section, field, value) => {
    setHouseDetails(prevDetails => ({
      ...prevDetails,
      [section]: {
        ...prevDetails[section],
        [field]: value
      }
    }));
  };

  const calculateMonthlyPayment = () => {
    const loanAmount = parseFloat(houseDetails.loan_details.loan_amount);
    const interestRate = parseFloat(houseDetails.loan_details.interest_rate) / 100 / 12; // Monthly interest rate
    const loanTerm = parseFloat(houseDetails.loan_details.loan_term) * 12; // Term in months
    
    if (loanAmount && interestRate && loanTerm) {
      const monthlyPayment = (loanAmount * interestRate * Math.pow(1 + interestRate, loanTerm)) / 
                            (Math.pow(1 + interestRate, loanTerm) - 1);
      
      handleInputChange('loan_details', 'monthly_payment', monthlyPayment.toFixed(2));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Calculate loan amount if not provided
      if (!houseDetails.loan_details.loan_amount && 
          houseDetails.purchase_details.purchase_price && 
          houseDetails.purchase_details.down_payment) {
        const purchasePrice = parseFloat(houseDetails.purchase_details.purchase_price);
        const downPayment = parseFloat(houseDetails.purchase_details.down_payment);
        const loanAmount = purchasePrice - downPayment;
        
        handleInputChange('loan_details', 'loan_amount', loanAmount.toString());
      }
      
      // Calculate monthly payment if not provided
      if (!houseDetails.loan_details.monthly_payment) {
        calculateMonthlyPayment();
      }
      
      let response;
      
      // Log the data being sent to the server
      console.log('Sending house details to server:', houseDetails);
      
      if (hasExistingDetails) {
        response = await axios.put(API_ENDPOINTS.HOUSE.DETAILS, houseDetails);
        console.log('Update response:', response.data);
        
        // Update the state with the response data to ensure it's in sync
        setHouseDetails(response.data);
        setSuccess('House details updated successfully!');
        
        // Exit edit mode
        setIsEditing(false);
        
        // Refresh the data to ensure we have the latest version
        setTimeout(() => {
          fetchHouseDetails();
        }, 500);
      } else {
        response = await axios.post(API_ENDPOINTS.HOUSE.DETAILS, houseDetails);
        console.log('Create response:', response.data);
        
        // Update the state with the response data to ensure it's in sync
        setHouseDetails(response.data);
        setSuccess('House details added successfully!');
        setHasExistingDetails(true);
        
        // Exit edit mode
        setIsEditing(false);
        
        // Refresh the data to ensure we have the latest version
        setTimeout(() => {
          fetchHouseDetails();
        }, 500);
      }
      
      setIsEditing(false);
      setSaving(false);
    } catch (err) {
      setError('Error saving house details. Please try again.');
      console.error('House details save error:', err);
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5">Loading house details...</div>;
  }

  return (
    <div className="house-details">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>House Details</h1>
        {hasExistingDetails && !isEditing && (
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            Edit Details
          </Button>
        )}
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      {isEditing ? (
        <Form onSubmit={handleSubmit}>
          <Card className="mb-4">
            <Card.Header>Address Information</Card.Header>
            <Card.Body>
              <Row>
                <Col md={12} className="mb-3">
                  <Form.Group>
                    <Form.Label>Street Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={houseDetails.address.street}
                      onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      value={houseDetails.address.city}
                      onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>State/Province</Form.Label>
                    <Form.Control
                      type="text"
                      value={houseDetails.address.state}
                      onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Zip/Postal Code</Form.Label>
                    <Form.Control
                      type="text"
                      value={houseDetails.address.zip_code}
                      onChange={(e) => handleInputChange('address', 'zip_code', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      type="text"
                      value={houseDetails.address.country}
                      onChange={(e) => handleInputChange('address', 'country', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          <Card className="mb-4">
            <Card.Header>Purchase Details</Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Purchase Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={houseDetails?.purchase_details?.purchase_date ? houseDetails.purchase_details.purchase_date.substring(0, 10) : ''}
                      onChange={(e) => handleInputChange('purchase_details', 'purchase_date', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Purchase Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      value={houseDetails.purchase_details.purchase_price}
                      onChange={(e) => handleInputChange('purchase_details', 'purchase_price', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Down Payment (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      value={houseDetails.purchase_details.down_payment}
                      onChange={(e) => handleInputChange('purchase_details', 'down_payment', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Closing Costs (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      value={houseDetails.purchase_details.closing_costs}
                      onChange={(e) => handleInputChange('purchase_details', 'closing_costs', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          <Card className="mb-4">
            <Card.Header>Property Details</Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Square Feet</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={houseDetails.property_details.square_feet}
                      onChange={(e) => handleInputChange('property_details', 'square_feet', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Bedrooms</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={houseDetails.property_details.bedrooms}
                      onChange={(e) => handleInputChange('property_details', 'bedrooms', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Bathrooms</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.5"
                      value={houseDetails.property_details.bathrooms}
                      onChange={(e) => handleInputChange('property_details', 'bathrooms', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Year Built</Form.Label>
                    <Form.Control
                      type="number"
                      min="1800"
                      max={new Date().getFullYear()}
                      value={houseDetails.property_details.year_built}
                      onChange={(e) => handleInputChange('property_details', 'year_built', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Lot Size</Form.Label>
                    <Form.Control
                      type="text"
                      value={houseDetails.property_details.lot_size}
                      onChange={(e) => handleInputChange('property_details', 'lot_size', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Property Type</Form.Label>
                    <Form.Select
                      value={houseDetails.property_details.property_type}
                      onChange={(e) => handleInputChange('property_details', 'property_type', e.target.value)}
                    >
                      <option value="Single Family">Single Family</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Condo">Condo</option>
                      <option value="Multi-Family">Multi-Family</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          <Card className="mb-4">
            <Card.Header>Loan Details</Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Loan Amount (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      value={houseDetails.loan_details.loan_amount}
                      onChange={(e) => handleInputChange('loan_details', 'loan_amount', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Interest Rate (%)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      value={houseDetails.loan_details.interest_rate}
                      onChange={(e) => {
                        handleInputChange('loan_details', 'interest_rate', e.target.value);
                      }}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Loan Term (years)</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={houseDetails.loan_details.loan_term}
                      onChange={(e) => {
                        handleInputChange('loan_details', 'loan_term', e.target.value);
                      }}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Monthly Payment (₹)</Form.Label>
                    <div className="d-flex">
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        value={houseDetails.loan_details.monthly_payment}
                        onChange={(e) => handleInputChange('loan_details', 'monthly_payment', e.target.value)}
                        required
                      />
                      <Button 
                        variant="outline-secondary" 
                        onClick={calculateMonthlyPayment}
                        className="ms-2"
                      >
                        Calculate
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Loan Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={houseDetails.loan_details.loan_start_date ? houseDetails.loan_details.loan_start_date.substring(0, 10) : ''}
                      onChange={(e) => handleInputChange('loan_details', 'loan_start_date', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Lender</Form.Label>
                    <Form.Control
                      type="text"
                      value={houseDetails.loan_details.lender}
                      onChange={(e) => handleInputChange('loan_details', 'lender', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Loan Type</Form.Label>
                    <Form.Select
                      value={houseDetails.loan_details.loan_type}
                      onChange={(e) => handleInputChange('loan_details', 'loan_type', e.target.value)}
                    >
                      <option value="Fixed Rate">Fixed Rate</option>
                      <option value="Adjustable Rate">Adjustable Rate</option>
                      <option value="FHA">FHA</option>
                      <option value="VA">VA</option>
                      <option value="USDA">USDA</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          <div className="d-flex justify-content-end mb-4">
            {hasExistingDetails && (
              <Button 
                variant="secondary" 
                className="me-2" 
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            )}
            <Button 
              variant="primary" 
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : (hasExistingDetails ? 'Update Details' : 'Save Details')}
            </Button>
          </div>
        </Form>
      ) : (
        <div className="house-details-view">
          <Row>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>Address Information</Card.Header>
                <Card.Body>
                  <p><strong>Street:</strong> {houseDetails.address?.street || 'N/A'}</p>
                  <p><strong>City:</strong> {houseDetails.address?.city || 'N/A'}</p>
                  <p><strong>State/Province:</strong> {houseDetails.address?.state || 'N/A'}</p>
                  <p><strong>Zip/Postal Code:</strong> {houseDetails.address?.zip_code || 'N/A'}</p>
                  <p><strong>Country:</strong> {houseDetails.address?.country || 'N/A'}</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>Purchase Details</Card.Header>
                <Card.Body>
                  <p><strong>Purchase Date:</strong> {houseDetails.purchase_details?.purchase_date ? new Date(houseDetails.purchase_details.purchase_date).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Purchase Price:</strong> {houseDetails.purchase_details?.purchase_price ? formatIndianCurrency(parseFloat(houseDetails.purchase_details.purchase_price)) : 'N/A'}</p>
                  <p><strong>Down Payment:</strong> {houseDetails.purchase_details?.down_payment ? formatIndianCurrency(parseFloat(houseDetails.purchase_details.down_payment)) : 'N/A'}</p>
                  <p><strong>Closing Costs:</strong> {houseDetails.purchase_details?.closing_costs ? formatIndianCurrency(parseFloat(houseDetails.purchase_details.closing_costs)) : '₹0'}</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>Property Details</Card.Header>
                <Card.Body>
                  <p><strong>Square Feet:</strong> {houseDetails.property_details?.square_feet || 'N/A'}</p>
                  <p><strong>Bedrooms:</strong> {houseDetails.property_details?.bedrooms || 'N/A'}</p>
                  <p><strong>Bathrooms:</strong> {houseDetails.property_details?.bathrooms || 'N/A'}</p>
                  <p><strong>Year Built:</strong> {houseDetails.property_details?.year_built || 'N/A'}</p>
                  <p><strong>Lot Size:</strong> {houseDetails.property_details?.lot_size || 'N/A'}</p>
                  <p><strong>Property Type:</strong> {houseDetails.property_details?.property_type || 'N/A'}</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>Loan Details</Card.Header>
                <Card.Body>
                  <p><strong>Loan Amount:</strong> {houseDetails.loan_details?.loan_amount ? formatIndianCurrency(parseFloat(houseDetails.loan_details.loan_amount)) : 'N/A'}</p>
                  <p><strong>Interest Rate:</strong> {houseDetails.loan_details?.interest_rate ? houseDetails.loan_details.interest_rate : 'N/A'}%</p>
                  <p><strong>Loan Term:</strong> {houseDetails.loan_details?.loan_term ? houseDetails.loan_details.loan_term : 'N/A'} years</p>
                  <p><strong>Monthly Payment:</strong> {houseDetails.loan_details?.monthly_payment ? formatIndianCurrency(parseFloat(houseDetails.loan_details.monthly_payment)) : 'N/A'}</p>
                  <p><strong>Loan Start Date:</strong> {houseDetails.loan_details?.loan_start_date ? new Date(houseDetails.loan_details.loan_start_date).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Lender:</strong> {houseDetails.loan_details?.lender || 'N/A'}</p>
                  <p><strong>Loan Type:</strong> {houseDetails.loan_details?.loan_type || 'N/A'}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default HouseDetails;
