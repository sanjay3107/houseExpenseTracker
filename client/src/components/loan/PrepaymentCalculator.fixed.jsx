import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Table, Alert } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { formatIndianCurrency, parseIndianAmount } from '../../utils/currencyFormatter';
import API_ENDPOINTS from '../../config/api';

const PrepaymentCalculator = () => {
  const [loanDetails, setLoanDetails] = useState({
    loanAmount: '',
    interestRate: '',
    loanTerm: '',
    prepaymentAmount: '',
    prepaymentFrequency: 'monthly',
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [houseDetails, setHouseDetails] = useState(null);
  const [useExistingLoan, setUseExistingLoan] = useState(false);

  useEffect(() => {
    const fetchHouseDetails = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.HOUSE.DETAILS);

        if (response.data && response.data.loanDetails) {
          setHouseDetails(response.data);
        }
      } catch (err) {
        // It's okay if we can't fetch house details
        console.log('No house details found');
      }
    };

    fetchHouseDetails();
  }, []);

  const handleInputChange = e => {
    const { name, value } = e.target;
    let parsedValue = value;

    // Convert lakh/crore notation to absolute numbers for loan and prepayment amounts
    if (name === 'loanAmount' || name === 'prepaymentAmount') {
      parsedValue = parseIndianAmount(value);
    }

    setLoanDetails(prev => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleUseExistingLoan = () => {
    if (houseDetails && houseDetails.loanDetails) {
      setLoanDetails(prev => ({
        ...prev,
        loanAmount: houseDetails.loanDetails.loanAmount,
        interestRate: houseDetails.loanDetails.interestRate,
        loanTerm: houseDetails.loanDetails.loanTerm,
      }));
      setUseExistingLoan(true);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Validate inputs
      if (
        isNaN(loanDetails.loanAmount) ||
        isNaN(loanDetails.interestRate) ||
        isNaN(loanDetails.loanTerm) ||
        isNaN(loanDetails.prepaymentAmount) ||
        parseFloat(loanDetails.loanAmount) <= 0 ||
        parseFloat(loanDetails.interestRate) <= 0 ||
        parseFloat(loanDetails.loanTerm) <= 0 ||
        parseFloat(loanDetails.prepaymentAmount) <= 0
      ) {
        setError('Please enter valid values for all fields.');
        setLoading(false);
        return;
      }

      // Calculate prepayment impact
      const response = await axios.post(API_ENDPOINTS.LOAN.PREPAYMENT, {
        loanAmount: parseFloat(loanDetails.loanAmount),
        interestRate: parseFloat(loanDetails.interestRate),
        loanTerm: parseFloat(loanDetails.loanTerm),
        prepaymentAmount: parseFloat(loanDetails.prepaymentAmount),
        prepaymentFrequency: loanDetails.prepaymentFrequency,
      });

      setResults(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error calculating prepayment impact. Please try again.');
      console.error('Prepayment calculation error:', err);
      setLoading(false);
    }
  };

  // Prepare chart data for balance comparison
  const getChartData = () => {
    if (
      !results ||
      !results.regularLoan ||
      !results.withPrepayment ||
      !results.prepaymentSchedule
    ) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Create simplified data for chart - actual months at yearly intervals
    const labels = [];
    const regularData = [];
    const prepaymentData = [];

    // Get data points at yearly intervals (or every 12 months)
    const regularTerm = results.regularLoan.termMonths;
    const prepaymentTerm = results.withPrepayment.termMonths;
    const maxTermMonths = Math.max(regularTerm, prepaymentTerm);
    const years = Math.ceil(maxTermMonths / 12);

    // Create year points
    for (let i = 0; i <= years; i++) {
      const monthPoint = i * 12;
      labels.push(`Year ${i}`);

      // For regular loan, calculate remaining balance at this year
      let regularBalance = 0;
      if (monthPoint <= regularTerm) {
        regularBalance = results.regularLoan.loanAmount * (1 - monthPoint / regularTerm);
      }
      regularData.push(regularBalance);

      // For prepayment loan, find balance at this year point
      let prepaymentBalance = 0;
      if (monthPoint <= prepaymentTerm) {
        // Find the payment record closest to this month point
        const closestPayment = results.prepaymentSchedule.find(p => p.month === monthPoint);
        if (closestPayment) {
          prepaymentBalance = closestPayment.balance;
        } else {
          // Simple linear estimation for missing points
          prepaymentBalance = results.withPrepayment.loanAmount * (1 - monthPoint / prepaymentTerm);
        }
      }
      prepaymentData.push(prepaymentBalance);
    }

    return {
      labels: labels,
      datasets: [
        {
          label: 'Regular Payment',
          data: regularData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.2,
        },
        {
          label: 'With Prepayment',
          data: prepaymentData,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // Disable animations to avoid re-render issues
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Loan Balance Over Time',
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function (context) {
            let value = context.raw;
            if (typeof value !== 'number') return '';
            return `${context.dataset.label}: ${formatIndianCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Years',
        },
        grid: {
          display: true,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Remaining Balance (₹)',
        },
        ticks: {
          callback: function (value) {
            if (typeof value !== 'number') return '';
            return formatIndianCurrency(value, { abbreviate: true });
          },
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="container-fluid py-4 px-4">
      <h1 className="mb-4">Prepayment Calculator</h1>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-4">
        <Col lg={4} md={12}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white">Loan Details</Card.Header>
            <Card.Body>
              {houseDetails && houseDetails.loanDetails && !useExistingLoan && (
                <Alert variant="info" className="mb-3">
                  You have existing loan details in your house profile.
                  <Button variant="link" className="p-0 ms-2" onClick={handleUseExistingLoan}>
                    Use these details
                  </Button>
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Loan Amount (₹)</Form.Label>
                  <Form.Text className="text-muted d-block mb-1">
                    You can enter values like "60L" or "1.5Cr"
                  </Form.Text>
                  <Form.Control
                    type="text"
                    name="loanAmount"
                    value={loanDetails.loanAmount}
                    onChange={handleInputChange}
                    placeholder="e.g., 60L or 1.5Cr"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Interest Rate (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="interestRate"
                    value={loanDetails.interestRate}
                    onChange={handleInputChange}
                    placeholder="e.g., 4.5"
                    min="0.1"
                    step="0.01"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Loan Term (years)</Form.Label>
                  <Form.Control
                    type="number"
                    name="loanTerm"
                    value={loanDetails.loanTerm}
                    onChange={handleInputChange}
                    placeholder="e.g., 20"
                    min="1"
                    max="30"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Prepayment Amount (₹)</Form.Label>
                  <Form.Text className="text-muted d-block mb-1">
                    You can enter values like "50K" or "1L"
                  </Form.Text>
                  <Form.Control
                    type="text"
                    name="prepaymentAmount"
                    value={loanDetails.prepaymentAmount}
                    onChange={handleInputChange}
                    placeholder="e.g., 5L or 1Cr"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Prepayment Frequency</Form.Label>
                  <Form.Select
                    name="prepaymentFrequency"
                    value={loanDetails.prepaymentFrequency}
                    onChange={handleInputChange}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="one-time">One-time</option>
                  </Form.Select>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 py-2" disabled={loading}>
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Calculating...
                    </>
                  ) : (
                    'Calculate'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {results && (
            <Card className="mt-4 shadow-sm border-0">
              <Card.Header className="bg-primary text-white">Prepayment Impact</Card.Header>
              <Card.Body>
                <div className="mb-4 p-3 bg-light rounded">
                  <h6 className="text-muted mb-2">Time Saved</h6>
                  <h3 className="text-success mb-0">
                    {Math.floor(results.withPrepayment.timeShortened / 12)} years,{' '}
                    {results.withPrepayment.timeShortened % 12} months
                  </h3>
                </div>

                <div className="mb-4 p-3 bg-light rounded">
                  <h6 className="text-muted mb-2">Interest Saved</h6>
                  <h3 className="text-primary mb-0">
                    {formatIndianCurrency(results.withPrepayment.interestSaved)}
                  </h3>
                  <small className="text-muted mt-2 d-block">
                    That's{' '}
                    {(
                      (results.withPrepayment.interestSaved / results.regularLoan.totalInterest) *
                      100
                    ).toFixed(1)}
                    % of total interest
                  </small>
                </div>

                <Table bordered size="sm" className="mt-3">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Regular Payment</th>
                      <th>With Prepayment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Monthly Payment</td>
                      <td>{formatIndianCurrency(results.regularLoan.monthlyPayment)}</td>
                      <td>{formatIndianCurrency(results.withPrepayment.monthlyPayment)}</td>
                    </tr>
                    <tr>
                      <td>Total Payment</td>
                      <td>{formatIndianCurrency(results.regularLoan.totalPayment)}</td>
                      <td>{formatIndianCurrency(results.withPrepayment.totalPayment)}</td>
                    </tr>
                    <tr>
                      <td>Total Interest</td>
                      <td>{formatIndianCurrency(results.regularLoan.totalInterest)}</td>
                      <td>{formatIndianCurrency(results.withPrepayment.totalInterest)}</td>
                    </tr>
                    <tr>
                      <td>Loan Term</td>
                      <td>
                        {Math.floor(results.regularLoan.termMonths / 12)} years,{' '}
                        {results.regularLoan.termMonths % 12} months
                      </td>
                      <td>
                        {Math.floor(results.withPrepayment.termMonths / 12)} years,{' '}
                        {results.withPrepayment.termMonths % 12} months
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={8} md={12}>
          {results && (
            <>
              <Card className="mb-4 shadow-sm border-0">
                <Card.Header className="bg-primary text-white">Balance Comparison</Card.Header>
                <Card.Body>
                  <div style={{ height: '400px' }}>
                    {/* Only render chart if we have results with required data */}
                    {results &&
                    results.regularLoan &&
                    results.withPrepayment &&
                    results.prepaymentSchedule &&
                    results.prepaymentSchedule.length > 0 ? (
                      <Line
                        data={getChartData()}
                        options={chartOptions}
                        key={`chart-${Date.now()}`} // Force new chart instance on re-render
                      />
                    ) : (
                      <div className="text-center p-5 text-muted">
                        <p>Chart data is being processed...</p>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>

              <Card className="shadow-sm border-0">
                <Card.Header className="bg-primary text-white">Prepayment Schedule</Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table striped hover size="sm">
                      <thead>
                        <tr>
                          <th>Payment #</th>
                          <th>Payment</th>
                          <th>Principal</th>
                          <th>Interest</th>
                          <th>Prepayment</th>
                          <th>Remaining Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.prepaymentSchedule.slice(0, 12).map(payment => (
                          <tr key={payment.month}>
                            <td>{payment.month}</td>
                            <td>{formatIndianCurrency(payment.payment)}</td>
                            <td>{formatIndianCurrency(payment.principal)}</td>
                            <td>{formatIndianCurrency(payment.interest)}</td>
                            <td>{formatIndianCurrency(payment.prepayment)}</td>
                            <td>{formatIndianCurrency(payment.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {results.prepaymentSchedule.length > 12 && (
                    <div className="text-center mt-3">
                      <small className="text-muted">
                        Showing first year of payments. Full schedule has{' '}
                        {results.prepaymentSchedule.length} payments.
                      </small>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default PrepaymentCalculator;
