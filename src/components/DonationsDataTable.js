import React, { useState } from 'react';
import { useQuery, ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { GET_ALL_DONATIONS } from '../queries/projectQueries';
import { Table, Button, Spin, Alert, Switch, DatePicker } from 'antd';
import * as XLSX from 'xlsx';
import { ReloadOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

// Create a separate Apollo Client for donations
const donationsClient = new ApolloClient({
  uri: process.env.REACT_APP_DONATION_HYGRAPH_API_URL,
  cache: new InMemoryCache(),
  headers: {
    Authorization: `Bearer ${process.env.REACT_APP_DONATION_HYGRAPH_AUTH_TOKEN}`
  }
});

function DonationsDataTable() {
  return (
    <ApolloProvider client={donationsClient}>
      <DonationsTable />
    </ApolloProvider>
  );
}

function DonationsTable() {
  const [isBlurred, setIsBlurred] = useState(true);
  const [dateRange, setDateRange] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  const { loading, error, data, refetch } = useQuery(GET_ALL_DONATIONS, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      setFilteredData([...data.donations].reverse());
    }
  });

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (!dates) {
      setFilteredData([...data.donations].reverse());
      return;
    }

    const [startDate, endDate] = dates;
    const filtered = data.donations.filter(donation => {
      const donationDate = new Date(donation.donationDate);
      const donationDateStr = donationDate.toISOString().split('T')[0];
      const startDateStr = startDate.format('YYYY-MM-DD');
      const endDateStr = endDate.format('YYYY-MM-DD');
      
      return donationDateStr >= startDateStr && donationDateStr <= endDateStr;
    });
    setFilteredData([...filtered].reverse());
  };

  const columns = [
    {
      title: 'Donation Date',
      dataIndex: 'donationDate',
      key: 'donationDate',
      sorter: (a, b) => new Date(a.donationDate) - new Date(b.donationDate),
      render: (text) => <div className={isBlurred ? "blur-content" : ""}>{text}</div>
    },
    { 
      title: 'Donation Amount', 
      dataIndex: 'donationAmount', 
      key: 'donationAmount',
      sorter: (a, b) => a.donationAmount - b.donationAmount,
      render: (amount) => (
        <div className={isBlurred ? "blur-content" : ""}>
          {amount.toFixed(2)}
        </div>
      )
    },
    { 
      title: 'First Name', 
      dataIndex: 'firstName', 
      key: 'firstName',
      render: (text) => <div className={isBlurred ? "blur-content" : ""}>{text}</div>
    },
    { 
      title: 'Last Name', 
      dataIndex: 'lastName', 
      key: 'lastName',
      render: (text) => <div className={isBlurred ? "blur-content" : ""}>{text}</div>
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email',
      render: (text) => <div className={isBlurred ? "blur-content" : ""}>{text}</div>
    },
    { 
      title: 'Full Address', 
      dataIndex: 'fullAddress', 
      key: 'fullAddress',
      render: (text) => <div className={isBlurred ? "blur-content" : ""}>{text}</div>
    },
  ];

  const exportToDonationsExcel = () => {
    const exportData = data.donations.map(({ id, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    const today = new Date().toISOString().split('T')[0];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Donations');
    XLSX.writeFile(workbook, `donations_data_${today}.xlsx`);
  };

  const exportRangeToDonationsExcel = () => {
    const exportData = filteredData.map(({ id, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    const today = new Date().toISOString().split('T')[0];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Donations');
    XLSX.writeFile(workbook, `donations_data_${today}_filtered.xlsx`);
  };

  if (loading) return <Spin size="large" />;
  if (error) return <Alert type="error" message={error.message} />;

  return (
    <div>
      <style>
        {`
          .blur-content {
            filter: blur(4px);
            transition: filter 0.2s ease;
          }
          ${isBlurred ? `
            tr:hover .blur-content {
              filter: blur(0);
            }
          ` : ''}
        `}
      </style>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <Button 
          type="primary" 
          onClick={exportToDonationsExcel}
        >
          Export all to Excel
        </Button>
        <Button
          type='primary'
          onClick={exportRangeToDonationsExcel}
          disabled={!dateRange}
        >
          Export Range to Excel
        </Button>
        <Button 
          onClick={() => refetch()}
          icon={<ReloadOutlined />}
        >
          Refresh
        </Button>
        <RangePicker 
          onChange={handleDateRangeChange}
          style={{ minWidth: '250px' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Switch 
            checked={isBlurred}
            onChange={setIsBlurred}
            checkedChildren={<EyeInvisibleOutlined />}
            unCheckedChildren={<EyeOutlined />}
          />
        </div>
      </div>
      <Table 
        columns={columns} 
        dataSource={filteredData}
        rowKey="id"
        scroll={{ x: true }}
      />
    </div>
  );
}

export default DonationsDataTable; 